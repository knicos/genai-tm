import React, { useState, useCallback } from 'react';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { Widget } from '../widget/Widget';
import { Webcam } from '../webcam/Webcam';
import style from './Input.module.css';
import { useTranslation } from 'react-i18next';
import { useVariant } from '../../util/variant';
import { Skeleton } from '@mui/material';
import { useRecoilState } from 'recoil';
import { predictedIndex, prediction } from '../../state';
import { TeachableMobileNet } from '@teachablemachine/image';

interface Props {
    disabled?: boolean;
    hidden?: boolean;
    enabled?: boolean;
    model?: TeachableMobileNet;
}

export default function Input({ enabled, model, ...props }: Props) {
    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);
    const [enableInput, setEnableInput] = useState(true);
    const [, setPredictions] = useRecoilState(prediction);
    const [, setPredictionIndex] = useRecoilState(predictedIndex);

    const doPrediction = useCallback(
        async (image: HTMLCanvasElement) => {
            if (model) {
                const p = await model.predict(image);
                setPredictions(p);

                const nameOfMax = p.reduce((prev, val) => (val.probability > prev.probability ? val : prev));
                setPredictionIndex(p.indexOf(nameOfMax));
            }
        },
        [setPredictions, setPredictionIndex, model]
    );

    const changeWebcamToggle = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
            setEnableInput(checked);
        },
        [setEnableInput]
    );

    return (
        <Widget
            dataWidget="input"
            title={t<string>('input.labels.title')}
            {...props}
        >
            <div className={style.container}>
                <div className={style.inputControls}>
                    <FormControlLabel
                        labelPlacement="start"
                        control={
                            <Switch
                                disabled={!enabled}
                                checked={enableInput}
                                onChange={changeWebcamToggle}
                            />
                        }
                        label={t<string>('input.labels.webcam')}
                    />
                </div>
                <div className={style.inputContainer}>
                    {enabled && (
                        <Webcam
                            disable={!enableInput}
                            capture={enableInput && enabled}
                            interval={200}
                            onCapture={doPrediction}
                        />
                    )}
                    {!enabled && (
                        <Skeleton
                            variant="rounded"
                            width={224}
                            height={224}
                        />
                    )}
                </div>
            </div>
        </Widget>
    );
}
