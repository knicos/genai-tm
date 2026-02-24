import { IClassification, modelState, predictedIndex, prediction, predictionError, trainingHistory, modelStats, TrainingMetrics } from '../state';
import { useAtom, useSetAtom, useAtomValue } from 'jotai';
import { useCallback, useEffect, useState, useRef } from 'react';
import { TeachableModel } from '@genai-fi/classifier';
import { calculateModelStatistics } from './modelStats';

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
    const [model, setModel] = useAtom(modelState);
    const currentModelRef = useRef<TeachableModel | undefined>(model);

    useEffect(() => {
        currentModelRef.current = model;
    }, [model]);

    // Create new model when variant changes
    useEffect(() => {
        setModel((old) => {
            if (old?.getVariant() === variant) return old;

            if (old) {
                try {
                    old.dispose();
                } catch (error) {
                    console.warn('Error disposing old model:', error);
                }
            }

            return new TeachableModel(variant);
        });
    }, [variant, setModel]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (currentModelRef.current) {
                try {
                    currentModelRef.current.dispose();
                } catch (error) {
                    console.warn('Error disposing model on unmount:', error);
                }
            }
        };
    }, []);
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
    const setHistory = useSetAtom(trainingHistory);
    const setStats = useSetAtom(modelStats);

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
                setHistory([]);
                const tm = new TeachableModel(model.getVariant() || 'image');

                const isReady = await tm.ready();
                if (!isReady) {
                    console.error('[Training] Failed to create new model - model.ready() returned false');
                    setStage('none');
                    return;
                }

                setStage('prepare');

                try {
                    await new Promise((resolve, reject) => {
                        setTimeout(() => {
                            tm.setLabels(data.map((t) => t.label));
                            tm.setSeed('something');
                            const promises = data.reduce<Promise<void>[]>(
                                (p, v, ix) => [...p, ...v.samples.map((s) => tm.addExample(ix, s.data))],
                                []
                            );
                            Promise.all(promises)
                                .then(() => resolve(undefined))
                                .catch((err) => {
                                    console.error('[Training] Error during sample preparation:', err);
                                    reject(err);
                                });
                        }, 10);
                    });
                } catch (e) {
                    console.error('Sample prep failed', e);
                    setStage('none');
                    return;
                }

                setStage('training');

                const historyData: TrainingMetrics[] = [];

                try {
                    await tm.train(
                        {
                            denseUnits: 100,
                            epochs: settings.epochs,
                            learningRate: settings.learningRate,
                            batchSize: settings.batchSize,
                        },
                        {
                            onEpochEnd: (epoch: number, logs?: Record<string, number>) => {
                                setEpochs(epoch / 50);

                                // Collect training metrics if available
                                if (logs) {
                                    historyData.push({
                                        epoch: epoch,
                                        loss: logs.loss || 0,
                                        accuracy: logs.acc || 0,
                                        valLoss: logs.val_loss,
                                        valAccuracy: logs.val_acc
                                    });
                                    setHistory([...historyData]);
                                }
                            },
                        }
                    );
                } catch (e) {
                    console.error('Training failed', e);
                    return;
                }

                // Calculate model statistics on validation set
                const stats = await calculateModelStatistics(tm, data);
                if (stats) {
                    setStats(stats);
                }

                setModel(tm);
                setStage('done');
            },
            [model, setModel]
        ),
    };
}
