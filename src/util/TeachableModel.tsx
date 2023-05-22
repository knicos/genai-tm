import { TeachableMobileNet, Metadata as ImageMetadata, createTeachable as createImage } from '@genai/tm-image';
import { TrainingParameters as ImageTrainingParams } from '@genai/tm-image/dist/teachable-mobilenet';
import { TrainingParameters as PoseTrainingParams } from '@genai/tm-pose/dist/teachable-posenet';
import { Pose } from '@tensorflow-models/posenet';
import {
    TeachablePoseNet,
    Metadata as PoseMetadata,
    drawKeypoints,
    drawSkeleton,
    createTeachable as createPose,
} from '@genai/tm-pose';
import * as tf from '@tensorflow/tfjs';
import { IClassification, modelState, predictedIndex, prediction } from '../state';
import { useRecoilState, useSetRecoilState, useRecoilValue } from 'recoil';
import { useCallback, useEffect, useState, useRef } from 'react';

export type TMType = 'image' | 'pose';

interface PredictionsOutput {
    className: string;
    probability: number;
}

interface TrainingParameters extends ImageTrainingParams, PoseTrainingParams {}

export type Metadata = ImageMetadata | PoseMetadata;

export class TeachableModel {
    private imageModel?: TeachableMobileNet;
    private poseModel?: TeachablePoseNet;
    private _ready?: Promise<boolean>;
    private trained = false;
    private lastPose?: Pose;
    private lastPoseOut?: Float32Array;
    private busy = false;
    private imageSize = 224;
    private variant: TMType = 'image';

    constructor(type: TMType, metadata?: Metadata, model?: tf.io.ModelJSON, weights?: ArrayBuffer) {
        this._ready = new Promise((resolve) => {
            let atype = type;
            if (metadata?.packageName) {
                if (metadata.packageName === '@teachablemachine/pose') {
                    atype = 'pose';
                } else if (metadata.packageName === '@teachablemachine/image') {
                    atype = 'image';
                }
            }

            this.variant = atype;

            if (atype === 'image') {
                this.loadImage(metadata, model, weights).then(() => resolve(true));
            } else if (atype === 'pose') {
                this.loadPose(metadata, model, weights).then(() => resolve(true));
            } else {
                resolve(false);
            }
        });
    }

    public getVariant() {
        return this.variant;
    }

    public getImageModel() {
        return this.imageModel;
    }

    public getPoseModel() {
        return this.poseModel;
    }

    public getImageSize() {
        return this.imageSize;
    }

    public isTrained() {
        return this.trained;
    }

    private async loadImage(metadata?: ImageMetadata, model?: tf.io.ModelJSON, weights?: ArrayBuffer) {
        await tf.ready();
        if (metadata && model && weights) {
            const tmmodel = await createImage(metadata, { version: 2, alpha: 0.35 });
            tmmodel.model = await tf.loadLayersModel({
                load: async () => {
                    return {
                        modelTopology: model.modelTopology,
                        weightData: weights,
                        weightSpecs: model.weightsManifest[0].weights,
                    };
                },
            });
            this.imageModel = tmmodel;
            this.trained = true;
        } else {
            const tmmodel = await createImage({ tfjsVersion: tf.version.tfjs }, { version: 2, alpha: 0.35 });
            this.imageModel = tmmodel;
            tmmodel.setName('My Model');
        }

        this.imageSize = this.imageModel.getMetadata().imageSize || 224;
    }

    private async loadPose(metadata?: PoseMetadata, model?: tf.io.ModelJSON, weights?: ArrayBuffer) {
        await tf.ready();
        if (metadata && model && weights) {
            this.trained = true;
            const tmmodel = await createPose(metadata);
            tmmodel.model = await tf.loadLayersModel({
                load: async () => {
                    return {
                        modelTopology: model.modelTopology,
                        weightData: weights,
                        weightSpecs: model.weightsManifest[0].weights,
                    };
                },
            });
            this.poseModel = tmmodel;
        } else {
            const tmmodel = await createPose({ tfjsVersion: tf.version.tfjs });
            this.poseModel = tmmodel;
            tmmodel.setName('My Model');
        }

        this.imageSize = (this.poseModel.getMetadata().modelSettings as any)?.posenet?.inputResolution || 257;
    }

    public async ready() {
        return this.isReady() || this._ready || false;
    }

    public isReady() {
        return !!(this.imageModel || this.poseModel);
    }

    public setSeed(seed: string) {
        if (this.imageModel) {
            this.imageModel.setSeed(seed);
        } else if (this.poseModel) {
            this.poseModel.setSeed(seed);
        }
    }

    public getMetadata() {
        if (this.imageModel) {
            return this.imageModel.getMetadata();
        } else if (this.poseModel) {
            return this.poseModel.getMetadata();
        }
    }

    public async save(handler: tf.io.IOHandler) {
        if (this.imageModel) {
            return this.imageModel.save(handler);
        } else if (this.poseModel) {
            return this.poseModel.save(handler);
        }
    }

    /**
     * If a pose is available, draw the keypoints and skeleton.
     *
     * @param image Image to draw the pose into.
     */
    public async draw(image: HTMLCanvasElement): Promise<void> {
        if (this.poseModel && this.lastPose) {
            const ctx = image.getContext('2d');
            if (this.lastPose && ctx) {
                try {
                    drawKeypoints(this.lastPose.keypoints, 0.5, ctx);
                    drawSkeleton(this.lastPose.keypoints, 0.5, ctx);
                } catch (e) {
                    console.error(e);
                }
            }
        }
    }

    /**
     * Estimate pose if this is a PoseNet model, otherwise do nothing.
     * This must be called for prediction to work with PoseNet.
     *
     * @param image Input image at correct resolution
     */
    public async estimate(image: HTMLCanvasElement): Promise<void> {
        if (this.poseModel && !this.busy) {
            // Only allow one estimate at a time.
            this.busy = true;
            try {
                const { pose, posenetOutput } = await this.poseModel.estimatePose(image);
                this.lastPose = pose;
                this.lastPoseOut = posenetOutput;
            } catch (e) {
                console.error('Estimation error', e);
            }
            this.busy = false;
        }
    }

    public async predict(image: HTMLCanvasElement): Promise<PredictionsOutput[]> {
        if (!this.trained) return [];

        if (this.imageModel) {
            return this.imageModel.predict(image);
        } else if (this.poseModel) {
            // Force an estimate if we are not generating one already
            if (!this.busy) {
                // Note: doesn't wait for estimate promise.
                this.estimate(image);
            }
            if (!this.lastPoseOut) return [];
            return this.poseModel.predict(this.lastPoseOut);
        }
        return [];
    }

    public async train(params: TrainingParameters, callbacks: tf.CustomCallbackArgs) {
        this.trained = true;
        if (this.imageModel) {
            return this.imageModel.train(params, callbacks);
        } else if (this.poseModel) {
            return this.poseModel.train(params, callbacks);
        }
    }

    public async addExample(className: number, image: HTMLCanvasElement) {
        if (this.imageModel) {
            return this.imageModel.addExample(className, image);
        } else if (this.poseModel) {
            const { heatmapScores, offsets, displacementFwd, displacementBwd } =
                await this.poseModel.estimatePoseOutputs(image);
            const posenetOutput = this.poseModel.poseOutputsToAray(
                heatmapScores,
                offsets,
                displacementFwd,
                displacementBwd
            );
            return this.poseModel.addExample(className, posenetOutput);
        }
    }

    public setLabels(labels: string[]) {
        if (this.imageModel) {
            this.imageModel.setLabels(labels);
        } else if (this.poseModel) {
            this.poseModel.setLabels(labels);
        }
    }

    public dispose() {
        if (this.imageModel) {
            if (this.imageModel.isTrained) {
                this.imageModel.dispose();
            } else {
                this.imageModel.model?.dispose();
            }
        }
        if (this.poseModel) {
            if (this.poseModel.isTrained) {
                this.poseModel.dispose();
            } else {
                this.poseModel.model?.dispose();
            }
        }
        this.imageModel = undefined;
        this.poseModel = undefined;
        this.lastPose = undefined;
        this.lastPoseOut = undefined;
    }

    public getLabels(): string[] {
        if (this.imageModel) {
            return this.imageModel.getLabels();
        } else if (this.poseModel) {
            return this.poseModel.getLabels();
        }
        return [];
    }

    public getLabel(ix: number): string {
        if (this.imageModel) {
            return this.imageModel.getLabel(ix);
        } else if (this.poseModel) {
            return this.poseModel.getLabel(ix);
        }
        return '';
    }
}

export function usePredictions() {
    const predictions = useRecoilValue(prediction);
    const index = useRecoilValue(predictedIndex);

    return {
        predictions,
        selectedClass: index,
    };
}

export function useTeachableModel() {
    const model = useRecoilValue(modelState);
    const setPredictions = useSetRecoilState(prediction);
    const setIndex = useSetRecoilState(predictedIndex);

    return {
        model,
        imageSize: model?.getImageSize() || 224,
        hasModel: !!model,
        canPredict: model?.isTrained() || false,
        variant: model?.getVariant() || 'image',
        predict: useCallback(
            async (image: HTMLCanvasElement) => {
                if (model && model.isTrained()) {
                    try {
                        const p = await model.predict(image);
                        if (p.length === 0) return;
                        setPredictions(p);
                        const nameOfMax = p.reduce((prev, val) => (val.probability > prev.probability ? val : prev));
                        setIndex(p.indexOf(nameOfMax));
                    } catch (e) {
                        console.error('Prediction failed', e);
                        setPredictions([]);
                        setIndex(-1);
                    }
                }
            },
            [model, setPredictions, setIndex]
        ),
        draw: useCallback(
            (image: HTMLCanvasElement) => {
                if (model) {
                    model.estimate(image);
                    model.draw(image);
                }
            },
            [model]
        ),
        estimate: useCallback(async (image: HTMLCanvasElement): Promise<void> => model?.estimate(image), [model]),
        labels: model?.getLabels() || ([] as string[]),
    };
}

export function useModelCreator(variant: TMType) {
    const oldModel = useRef<TeachableModel | undefined>();
    const [model, setModel] = useRecoilState(modelState);

    useEffect(() => {
        setModel((old) => {
            if (old?.getVariant() === variant) return old;
            return new TeachableModel(variant);
        });
    }, [variant, setModel]);

    // Garbage all old models.
    useEffect(() => {
        if (oldModel.current && oldModel.current !== model) {
            oldModel.current.dispose();
        }
        oldModel.current = model;
    }, [model]);
}

export function useModelLoader() {
    const setModel = useSetRecoilState(modelState);

    return useCallback(
        (metadata?: ImageMetadata | PoseMetadata, model?: tf.io.ModelJSON, weights?: ArrayBuffer) => {
            const newmodel = new TeachableModel('image', metadata, model, weights);
            setModel(newmodel);
            return newmodel.ready();
        },
        [setModel]
    );
}

export type TrainingState = 'none' | 'loading' | 'prepare' | 'training' | 'done';

export interface TrainingSettings {
    epochs: number;
    learningRate: number;
    batchSize: number;
}

export function useModelTrainer() {
    const [model, setModel] = useRecoilState(modelState);
    const [stage, setStage] = useState<TrainingState>('none');
    const [epochs, setEpochs] = useState(0);

    useEffect(() => {
        if (model) {
            model.ready().then((v) => {
                if (v && model.isTrained()) setStage('done');
            });
        } else setStage('none');
    }, [model]);

    return {
        stage,
        epochs,
        clearTraining: useCallback(() => {
            setStage('none');
        }, [setStage]),
        train: useCallback(
            async (data: IClassification[], settings: TrainingSettings) => {
                if (!model) {
                    console.error('No model prior to training');
                    return;
                }

                setStage('loading');
                setEpochs(0);
                const tm = new TeachableModel(model.getVariant() || 'image');

                if (!(await tm.ready())) {
                    console.error('Failed to create new model for training');
                    return;
                }

                setStage('prepare');

                try {
                    await new Promise((resolve) => {
                        setTimeout(() => {
                            tm.setLabels(data.map((t) => t.label));
                            tm.setSeed('something');
                            const promises = data.reduce<Promise<void>[]>(
                                (p, v, ix) => [...p, ...v.samples.map((s) => tm.addExample(ix, s))],
                                []
                            );
                            Promise.all(promises).then(resolve);
                        }, 10);
                    });
                } catch (e) {
                    console.error('Sample prep failed', e);
                    return;
                }

                setStage('training');

                try {
                    await tm.train(
                        {
                            denseUnits: 100,
                            epochs: settings.epochs,
                            learningRate: settings.learningRate,
                            batchSize: settings.batchSize,
                        },
                        {
                            onEpochEnd: (epoch, logs) => {
                                setEpochs(epoch / 50);
                            },
                        }
                    );
                } catch (e) {
                    console.error('Training failed', e);
                    return;
                }

                setModel(tm);
                setStage('done');
            },
            [model, setModel]
        ),
    };
}
