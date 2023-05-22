import React from 'react';
import { Webcam } from '../webcam/Webcam';
import Skeleton from '@mui/material/Skeleton';

interface Props {
    enabled?: boolean;
    enableInput?: boolean;
    doPrediction: (image: HTMLCanvasElement) => Promise<void>;
    doPostProcess?: (image: HTMLCanvasElement) => void;
    size: number;
}

export default function WebcamInput({ size, enabled, enableInput, doPrediction, doPostProcess }: Props) {
    return (
        <>
            {enabled && (
                <Webcam
                    disable={!enableInput}
                    capture={enableInput && enabled}
                    interval={200}
                    direct
                    onCapture={doPrediction}
                    onPostprocess={doPostProcess}
                    size={size}
                />
            )}
            {!enabled && (
                <Skeleton
                    variant="rounded"
                    width={size}
                    height={size}
                />
            )}
        </>
    );
}
