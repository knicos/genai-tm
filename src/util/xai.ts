import { TeachableMobileNet } from '@knicos/tm-image';
import * as tf from '@tensorflow/tfjs';

export function cropTensor(img: tf.Tensor3D): tf.Tensor3D {
    const size = Math.min(img.shape[0], img.shape[1]);
    const centerHeight = img.shape[0] / 2;
    const beginHeight = centerHeight - size / 2;
    const centerWidth = img.shape[1] / 2;
    const beginWidth = centerWidth - size / 2;

    return img.slice([beginHeight, beginWidth, 0], [size, size, 3]);
}

function capture(rasterElement: HTMLCanvasElement) {
    return tf.tidy(() => {
        const pixels = tf.browser.fromPixels(rasterElement);

        // crop the image so we're using the center square
        const cropped = cropTensor(pixels);

        // Expand the outer most dimension so we have a batch size of 1
        const batchedImage = cropped.expandDims(0);

        // Normalize the image between -1 and a1. The image comes in between 0-255
        // so we divide by 127 and subtract 1.
        return batchedImage.toFloat().div(tf.scalar(127)).sub(tf.scalar(1));
    });
}

export class CAM {
    private mobileNet: TeachableMobileNet;
    private activationModel: tf.Sequential;
    private exposedMobileNet: tf.LayersModel;

    constructor(mobileNet: TeachableMobileNet) {
        this.mobileNet = mobileNet;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const tModel = (mobileNet.model.layers[1] as any).model as tf.Sequential;

        this.activationModel = tf.sequential({
            layers: [
                tf.layers.dense({
                    inputShape: [1280],
                    units: 100,
                    activation: 'relu',
                    kernelInitializer: 'varianceScaling',
                    useBias: true,
                    weights: tModel.layers[1].getWeights(),
                }),
                tf.layers.dense({
                    kernelInitializer: 'varianceScaling',
                    useBias: false,
                    activation: 'relu', // 'softmax',
                    units: tModel.outputs[0].shape[1] || 1,
                    weights: tModel.layers[2].getWeights(),
                }),
            ],
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const model = (this.mobileNet.model.layers[0] as any).model as tf.Sequential;
        const conv1bn = model.getLayer('out_relu');

        this.exposedMobileNet = tf.model({
            inputs: this.mobileNet.model.input,
            outputs: [conv1bn.output as tf.SymbolicTensor, model.output as tf.SymbolicTensor],
        });
    }

    public dispose() {
        this.activationModel.dispose();
    }

    private async mapTensorToPredictions(data: tf.Tensor) {
        const convFeatures = tf.tidy(() => {
            const classes = this.activationModel.predict(data);
            if (Array.isArray(classes)) throw new Error('unexpected_array');
            return classes.softmax();
        });
        const values = await convFeatures.data();
        convFeatures.dispose();
        const classes = [];
        for (let i = 0; i < values.length; i++) {
            classes.push({
                className: this.mobileNet.getMetadata().labels[i],
                probability: values[i],
            });
        }
        return classes;
    }

    private calculateActivations(finalConv: tf.Tensor, classIndex: number) {
        return tf.tidy(() => {
            // 1. Reshape to a batch of features instead of GAP
            const batchFeatures = finalConv.reshape([7 * 7, 1280]); //.relu6();
            // 2. Get the linear class predictions for each convolution
            const convFeatures = this.activationModel.predict(batchFeatures);
            if (Array.isArray(convFeatures)) throw new Error('unexpected_array');

            const classFeatures = convFeatures.gather([classIndex], 1);
            const min = classFeatures.min();
            const max = classFeatures.max().sub(min);
            const normDist = classFeatures.sub(min).div(max);
            // Extract the selected class and reshape back to the input dimensions
            const cam = normDist.reshape([7, 7, 1]);
            return cam;
        });
    }

    public async createCAM(image: HTMLCanvasElement) {
        const imageTensor = capture(image);
        const layerOutputs = this.exposedMobileNet.predict(imageTensor);
        imageTensor.dispose();
        if (!Array.isArray(layerOutputs)) throw new Error('not_array');

        const predictions = await this.mapTensorToPredictions(layerOutputs[1]);

        // Get best index
        const nameOfMax = predictions.reduce((prev, val) => (val.probability > prev.probability ? val : prev));
        const ix = predictions.indexOf(nameOfMax);
        const cam = this.calculateActivations(layerOutputs[0], ix);

        layerOutputs.forEach((output) => {
            output.dispose();
        });

        const resized = tf.tidy(() => {
            const finalSum = cam.resizeBilinear([image.width, image.height], false, true);
            const finalMax = finalSum.max();
            const final = finalSum.div(finalMax);

            return final.reshape([image.width, image.height]);
        });
        cam.dispose();

        const finalData = (await resized.array()) as number[][];
        resized.dispose();

        return { predictions, classIndex: ix, heatmapData: finalData };
    }
}
