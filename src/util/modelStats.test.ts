import { describe, it, expect } from 'vitest';
import { calculateModelStatistics } from './modelStats';
import { TeachableModel } from '@genai-fi/classifier';

describe('calculateModelStatistics', () => {
    it('maps predicted class by className instead of prediction array index', async () => {
        const train1 = document.createElement('canvas');
        const val1 = document.createElement('canvas');
        const train2 = document.createElement('canvas');
        const val2 = document.createElement('canvas');

        const mockModel = {
            getLabels: () => ['class1', 'class2'],
            getNumExamples: () => 4,
            getNumValidation: () => 2,
            predict: async (image: HTMLCanvasElement) => {
                if (image === val1) {
                    return {
                        predictions: [
                            { className: 'class2', probability: 0.9 },
                            { className: 'class1', probability: 0.1 },
                        ],
                    };
                }

                return {
                    predictions: [
                        { className: 'class1', probability: 0.9 },
                        { className: 'class2', probability: 0.1 },
                    ],
                };
            },
        } as unknown as TeachableModel;

        const data = [
            {
                label: 'class1',
                samples: [
                    { id: 'train1', data: train1 },
                    { id: 'val1', data: val1 },
                ],
            },
            {
                label: 'class2',
                samples: [
                    { id: 'train2', data: train2 },
                    { id: 'val2', data: val2 },
                ],
            },
        ];

        const stats = await calculateModelStatistics(mockModel, data);

        expect(stats).not.toBeNull();
        expect(stats?.confusionMatrix).toEqual([
            [0, 1],
            [1, 0],
        ]);
        expect(stats?.accuracyPerClass).toEqual([
            { accuracy: 0, samples: 1 },
            { accuracy: 0, samples: 1 },
        ]);
    });
});
