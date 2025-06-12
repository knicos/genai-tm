import { IClassification, modelState, predictedIndex, prediction, predictionError } from '../state';
import { useAtom, useSetAtom, useAtomValue } from 'jotai';
import { useCallback, useEffect, useState, useRef } from 'react';
import { TeachableModel } from '@genai-fi/classifier';

export type TMType = 'image' | 'pose';

export interface PredictionsOutput {
    className: string;
    probability: number;
}

export interface ExplainedPredictionsOutput {
    predictions: PredictionsOutput[];
    heatmap?: number[][];
}

export function usePredictions() {
    const predictions = useAtomValue(prediction);
    const index = useAtomValue(predictedIndex);

    return {
        predictions,
        selectedClass: index,
    };
}

export function useTeachableModel() {
    const model = useAtomValue(modelState);
    const setPredictions = useSetAtom(prediction);
    const setError = useSetAtom(predictionError);
    const setIndex = useSetAtom(predictedIndex);

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
                        if (p.predictions.length === 0) return;
                        if (p.predictions.some((p) => isNaN(p.probability))) {
                            setError(true);
                            return;
                        }
                        setPredictions(p.predictions);
                        const nameOfMax = p.predictions.reduce((prev, val) =>
                            val.probability > prev.probability ? val : prev
                        );
                        setIndex(p.predictions.indexOf(nameOfMax));
                    } catch (e) {
                        console.error('Prediction failed', e);
                        setPredictions([]);
                        setIndex(-1);
                        setError(true);
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
    const oldModel = useRef<TeachableModel | undefined>(undefined);
    const [model, setModel] = useAtom(modelState);

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

export type TrainingState = 'none' | 'loading' | 'prepare' | 'training' | 'done';

export interface TrainingSettings {
    epochs: number;
    learningRate: number;
    batchSize: number;
}

export function useModelTrainer() {
    const [model, setModel] = useAtom(modelState);
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
                                (p, v, ix) => [...p, ...v.samples.map((s) => tm.addExample(ix, s.data))],
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
                            onEpochEnd: (epoch: number) => {
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
