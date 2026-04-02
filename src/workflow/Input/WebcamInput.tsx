import { fatalWebcam } from '@genaitm/state';
import { Webcam } from '@genai-fi/base';
import Skeleton from '@mui/material/Skeleton';
import { useCallback } from 'react';
import { useSetAtom } from 'jotai';
import style from './Input.module.css';

interface Props {
    enabled?: boolean;
    enableInput?: boolean;
    doPrediction: (image: HTMLCanvasElement, timestamp: number) => Promise<void>;
    doPostProcess?: (input: HTMLCanvasElement, output: HTMLCanvasElement, timestamp: number) => void;
    size: number;
}

export default function WebcamInput({ size, enabled, enableInput, doPrediction, doPostProcess }: Props) {
    const setFatal = useSetAtom(fatalWebcam);
    const doFatal = useCallback(() => setFatal(true), [setFatal]);

    return (
        <div className={style.webcamcontainer}>
            {enabled && (
                <Webcam
                    disable={!enableInput}
                    capture={enableInput && enabled}
                    interval={200}
                    direct
                    onCapture={doPrediction}
                    onPostprocess={doPostProcess}
                    size={size}
                    onFatal={doFatal}
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
    );
}
