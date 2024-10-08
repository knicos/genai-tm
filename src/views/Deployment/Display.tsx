import React, { useEffect } from 'react';
import { BehaviourType } from '../../components/Behaviour/Behaviour';
import RawOutput from '../../components/Output/RawOutput';
import { useRecoilState } from 'recoil';
import { predictedIndex } from '../../state';
import { ExplainedPredictionsOutput, TeachableModel } from '../../util/TeachableModel';

export interface WrappedInput {
    element: HTMLCanvasElement;
}

interface Props extends React.PropsWithChildren {
    input: WrappedInput | null;
    behaviours?: BehaviourType[];
    scaleFactor: number;
    volume: number;
    model: TeachableModel | null;
    error?: string;
}

export default function Display({ input, behaviours, scaleFactor, volume, model, error, children }: Props) {
    const [predicted, setPredictionIndex] = useRecoilState(predictedIndex);

    useEffect(() => {
        async function update() {
            let predictions: ExplainedPredictionsOutput = { predictions: [] };

            if (model && input) {
                predictions = await model.predict(input.element);
            }

            if (predictions.predictions.length > 0) {
                const nameOfMax = predictions.predictions.reduce((prev, val) =>
                    val.probability > prev.probability ? val : prev
                );
                setPredictionIndex(predictions.predictions.indexOf(nameOfMax));
            } else {
                setPredictionIndex(-1);
            }
        }
        update();
    }, [input, model, setPredictionIndex]);

    return (
        <RawOutput
            behaviours={behaviours || []}
            predicted={predicted}
            scaleFactor={scaleFactor}
            volume={volume}
            error={error}
        >
            {children}
        </RawOutput>
    );
}
