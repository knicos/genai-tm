import { TeachableModel } from '../../util/TeachableModel';

export function createAnalysis(labels: string[], ref: number[], pred: number[]) {
    const confusion = labels.map(() => labels.map(() => 0));

    ref.forEach((r, ix) => {
        const p = pred[ix];
        ++confusion[r][p];
    });

    const accuracyPerClass = labels.map((_, ix) => {
        const totalRow = confusion[ix].reduce((a, b) => a + b, 0);

        return {
            accuracy: confusion[ix][ix] / totalRow,
            samples: totalRow,
        };
    });

    const precisionPerClass = labels.map((_, ix) => {
        const totalCol = confusion.reduce((a, b) => a + b[ix], 0);

        return {
            precision: confusion[ix][ix] / totalCol,
            samples: totalCol,
        };
    });

    const accuracy = labels.reduce((a, _, ix) => a + confusion[ix][ix], 0) / ref.length;

    return {
        labels,
        confusion,
        accuracyPerClass,
        precisionPerClass,
        accuracy,
    };
}

export type AnalysisType = ReturnType<typeof createAnalysis>;

export function createModelStats(model: TeachableModel) {
    return {
        totalSamples: model.getNumExamples(),
        validationSamples: model.getNumValidation(),
        samplesPerClass: model.getExamplesPerClass(),
    };
}

export type ModelStatsType = ReturnType<typeof createModelStats>;
