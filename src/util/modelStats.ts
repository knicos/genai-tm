import { TeachableModel } from '@genai-fi/classifier';
import { IClassification } from '../state';

export interface ModelStatistics {
    labels: string[];
    confusionMatrix: number[][];
    accuracyPerClass: { accuracy: number; samples: number }[];
    overallAccuracy: number;
}

/**
 * Calculate model statistics on validation set
 * @param tm - The trained TeachableModel
 * @param data - The classification data used for training
 * @returns Model statistics including confusion matrix and accuracy metrics
 */
export async function calculateModelStatistics(
    tm: TeachableModel,
    data: IClassification[]
): Promise<ModelStatistics | null> {
    const labels = tm.getLabels();
    const labelToIndex = new Map(labels.map((label, index) => [label, index]));
    const numExamples = tm.getNumExamples();
    const numValidation = tm.getNumValidation();

    if (numExamples === 0 || numValidation === 0) {
        return null;
    }

    // Initialize confusion matrix
    const confusionMatrix = labels.map(() => labels.map(() => 0));

    // Track correct predictions per class for accuracy calculation
    const correctPerClass: number[] = labels.map(() => 0);
    const validationSamplesPerClass: number[] = labels.map(() => 0);

    // Get validation data by filtering based on total examples
    // TeachableModel uses last portion as validation set
    const validationRatio = numValidation / numExamples;

    for (const [actualClassIdx, classData] of data.entries()) {
        const numClassSamples = classData.samples.length;
        const validationStart = Math.floor(numClassSamples * (1 - validationRatio));

        // Get validation samples for this class
        const validationSamples = classData.samples.slice(validationStart);
        validationSamplesPerClass[actualClassIdx] = validationSamples.length;

        // Predict each validation sample
        for (const sample of validationSamples) {
            try {
                // For pose models, sample.data is HTMLCanvasElement
                // The model internally extracts pose keypoints
                const result = await tm.predict(sample.data);

                // Skip if no predictions (shouldn't happen but be safe)
                if (!result.predictions || result.predictions.length === 0) {
                    console.warn('Empty predictions for validation sample');
                    continue;
                }

                const predictedClass = result.predictions.reduce((prev, curr) =>
                    curr.probability > prev.probability ? curr : prev
                );
                const predictedClassIdx = labelToIndex.get(predictedClass.className);

                if (predictedClassIdx === undefined) {
                    console.warn('Predicted class is not present in model labels', predictedClass.className);
                    continue;
                }

                confusionMatrix[actualClassIdx][predictedClassIdx]++;

                if (predictedClassIdx === actualClassIdx) {
                    correctPerClass[actualClassIdx]++;
                }
            } catch (err) {
                console.error('Prediction failed for validation sample:', err);
            }
        }
    }

    // Calculate accuracy per class
    const accuracyPerClass = labels.map((_, ix) => ({
        accuracy: validationSamplesPerClass[ix] > 0 ? correctPerClass[ix] / validationSamplesPerClass[ix] : 0,
        samples: validationSamplesPerClass[ix],
    }));

    // Calculate overall accuracy
    const totalValidation = validationSamplesPerClass.reduce((a, b) => a + b, 0);
    const totalCorrect = correctPerClass.reduce((a, b) => a + b, 0);
    const overallAccuracy = totalValidation > 0 ? totalCorrect / totalValidation : 0;

    return {
        labels,
        confusionMatrix,
        accuracyPerClass,
        overallAccuracy,
    };
}
