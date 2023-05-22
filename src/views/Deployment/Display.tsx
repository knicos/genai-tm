import React, { useEffect } from 'react';
import { BehaviourType } from '../../components/Behaviour/Behaviour';
import RawOutput from '../../components/Output/RawOutput';
import { useRecoilState } from 'recoil';
import { predictedIndex } from '../../state';
import { TeachableModel } from '../../util/TeachableModel';

interface Predictions {
    className: string;
    probability: number;
}

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
            let predictions: Predictions[] = [];

            if (model && input) {
                predictions = await model.predict(input.element);
            }

            if (predictions.length > 0) {
                const nameOfMax = predictions.reduce((prev, val) => (val.probability > prev.probability ? val : prev));
                setPredictionIndex(predictions.indexOf(nameOfMax));
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
