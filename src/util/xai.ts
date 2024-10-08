import { TeachableMobileNet } from '@knicos/tm-image';
import * as tf from '@tensorflow/tfjs';

export function cropTensor(img: tf.Tensor3D, grayscaleModel?: boolean, grayscaleInput?: boolean): tf.Tensor3D {
    const size = Math.min(img.shape[0], img.shape[1]);
    const centerHeight = img.shape[0] / 2;
    const beginHeight = centerHeight - size / 2;
    const centerWidth = img.shape[1] / 2;
    const beginWidth = centerWidth - size / 2;

    if (grayscaleModel && !grayscaleInput) {
        //cropped rgb data
        let grayscale_cropped = img.slice([beginHeight, beginWidth, 0], [size, size, 3]);

        grayscale_cropped = grayscale_cropped.reshape([size * size, 1, 3]);
        const rgb_weights = [0.2989, 0.587, 0.114];
        grayscale_cropped = tf.mul(grayscale_cropped, rgb_weights);
        grayscale_cropped = grayscale_cropped.reshape([size, size, 3]);

        grayscale_cropped = tf.sum(grayscale_cropped, -1);
        grayscale_cropped = tf.expandDims(grayscale_cropped, -1);

        return grayscale_cropped;
    }
    return img.slice([beginHeight, beginWidth, 0], [size, size, 3]);
}

function capture(rasterElement: HTMLCanvasElement) {
    return tf.tidy(() => {
        const pixels = tf.browser.fromPixels(rasterElement);

        // crop the image so we're using the center square
        const cropped = cropTensor(pixels, false);

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
        const block12 = model.getLayer('block_6_project_BN'); // block_12_depthwise_relu
        const block5 = model.getLayer('block_3_project_BN'); // block_5_depthwise_relu
        const block2 = model.getLayer('block_1_project_BN'); // block_2_depthwise_relu
        const expRelu = model.getLayer('expanded_conv_project_BN'); // expanded_conv_depthwise_relu

        this.exposedMobileNet = tf.model({
            inputs: this.mobileNet.model.input,
            outputs: [
                conv1bn.output as tf.SymbolicTensor,
                model.output as tf.SymbolicTensor,
                block12.output as tf.SymbolicTensor,
                block5.output as tf.SymbolicTensor,
                block2.output as tf.SymbolicTensor,
                expRelu.output as tf.SymbolicTensor,
            ],
        });
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

    private executeBlock(
        start: tf.layers.Layer,
        end: tf.layers.Layer,
        input: tf.Tensor,
        expected: tf.Tensor
    ): tf.Tensor {
        return tf.tidy(() => {
            let l = start.outboundNodes[0].outboundLayer;
            let t = input;
            let a = input;
            while (l && l !== end) {
                if (l.inboundNodes[0].inboundLayers.length === 2) {
                    //const skipTensor = l.inboundNodes[0].inboundLayers[0].outboundNodes[1].outputTensors[0] as tf.SymbolicTensor;
                    t = l.apply([t, a]) as tf.Tensor;
                } else {
                    t = l.apply(t) as tf.Tensor;
                }
                if (l.outboundNodes.length > 1) {
                    a = t;
                }
                l = l.outboundNodes[0].outboundLayer;
            }
            if (l) {
                t = l.apply(t) as tf.Tensor;
            }

            //console.log('exec', input, t);
            //return t.sub(expected).abs().sum(3); //.sub(expected).square().sum(3); //abs().sum(3);
            return t.squaredDifference(expected).sum(3);
        });
    }

    featureSensitivity(
        start: tf.layers.Layer,
        end: tf.layers.Layer,
        input: tf.Tensor,
        expected: tf.Tensor,
        attention: tf.Tensor
    ): tf.Tensor {
        return tf.tidy(() => {
            const inX = input.shape[1] || 0;
            const inY = input.shape[1] || 0;
            const dimY = expected.shape[1] || 0;
            const dimX = expected.shape[2] || 0;

            let result = tf.zeros([1, input.shape[1] || 1, input.shape[2] || 1, 1]);
            //const updates = tf.ones([dimY * dimX, input.shape[3] || 1]);
            const fillOnes = new Array(input.shape[3] || 1).fill(1);

            // Convolution filter is 3x3
            for (let fy = 0; fy < 3; ++fy) {
                for (let fx = 0; fx < 3; ++fx) {
                    const indices = [];
                    const updates = [];

                    for (let y = 3; y < 4; ++y) {
                        for (let x = 3; x < 4; ++x) {
                            const ix = x * 3 + fx;
                            const iy = y * 3 + fy;
                            if (ix < inX && y < inY) {
                                indices.push([0, iy, ix]);
                                updates.push(fillOnes);
                            }
                        }
                    }

                    //if (fx === 0 && fy === 0) console.log('INDICES', indices);

                    //console.log(indices, updates, input.shape);

                    const sliced = tf.scalar(1).sub(tf.scatterND(indices, updates, input.shape)).mul(input);

                    const errors = this.executeBlock(start, end, sliced, expected)
                        .reshape([dimY * dimX])
                        .softmax()
                        .reshape([dimY, dimX, 1])

                        .mul(attention);
                    //if (fx === 0 && fy === 0) console.log('SLICE', errors.arraySync());
                    //const scatterErrors = tf.scatterND(indices, errors.reshape([dimX * dimY, 1]), result.shape);
                    //const resizedErrors = errors.resizeNearestNeighbor([result.shape[1] || 1, result.shape[2] || 1]);
                    const mask = tf.scatterND(indices, errors.sum().reshape([1, 1]), result.shape);
                    //if (fx === 0 && fy === 0) console.log('ERRORS', mask.arraySync());
                    //const maskedErrors = resizedErrors; //.mul(mask);
                    //if (fx === 0 && fy === 0) console.log('merr', maskedErrors.arraySync());
                    result = result.add(mask);
                }
            }

            //console.log('RESULT', result, result.arraySync());

            //return tf.concat(array).reshape([1, dimY, dimX, 1]);
            return result.reshape([input.shape[1] || 1, input.shape[2] || 1, 1]);
        });
    }

    private upscale(cam: tf.Tensor) {
        //const sensi1 = this.featureSensitivity(block12, conv1bn, features[2], features[0], cam);
        //const sensi2 = this.featureSensitivity(block5, block12, features[3], features[2]);
        //const sensi3 = this.featureSensitivity(block2, block5, features[4], features[3]);

        // 3. Generate a feature activation map for a larger convolution layer
        /*const f12 = sensi1; //.mul(cam.resizeNearestNeighbor([14, 14]));
                            const f12Min = f12.min();
                            const f12Max = f12.max().sub(f12Min);
                            const f12Norm = f12
                                .sub(f12Min)
                                .div(f12Max)
                                //.add(cam.resizeBilinear([14, 14]))
                                .reshape([14, 14, 1]);*/

        /*const f5 = sensi2.mul(f12Norm.resizeNearestNeighbor([28, 28]));
                            const f5Min = f5.min();
                            const f5Max = f5.max().sub(f5Min);
                            const f5Norm = f5
                                .sub(f5Min)
                                .div(f5Max)
                                //.add(f12Norm.resizeBilinear([28, 28]))

                                .reshape([28, 28, 1]);*/

        /*const f2 = sensi3.mul(f5Norm.resizeNearestNeighbor([56, 56]));
                            //const f2Min = f2.min();
                            const f2Max = f2.max(); //.sub(f2Min);
                            const f2Norm = f2
                                //.sub(f2Min)
                                .div(f2Max)
                                .add(f5Norm.resizeBilinear([56, 56]))
                                .reshape([56, 56, 1]);*/

        /*const fe = features[5].max(3, true).mul(f2Norm.resizeNearestNeighbor([112, 112]));
                            const feMin = fe.min();
                            const feMax = fe.max().sub(feMin);
                            const feNorm = fe
                                .sub(feMin)
                                .div(feMax)

                                .reshape([112, 112, 1]);*/
        return cam;
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

        const upscaledCAM = this.upscale(cam);

        layerOutputs.forEach((output) => {
            output.dispose();
        });

        const resized = tf.tidy(() => {
            const finalSum = upscaledCAM.resizeBilinear([224, 224], false, true);
            //const finalMin = finalSum.min();
            const finalMax = finalSum.max();
            const final = finalSum.div(finalMax);

            return final.reshape([224, 224]);
        });
        cam.dispose();
        upscaledCAM.dispose();

        const finalData = (await resized.array()) as number[][];
        resized.dispose();

        return { predictions, classIndex: ix, heatmapData: finalData };
    }
}
