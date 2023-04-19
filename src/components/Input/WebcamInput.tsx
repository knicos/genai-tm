import React from 'react';
import { Webcam } from '../webcam/Webcam';
import Skeleton from '@mui/material/Skeleton';

interface Props {
    enabled?: boolean;
    enableInput?: boolean;
    doPrediction: (image: HTMLCanvasElement) => Promise<void>;
}

export default function WebcamInput({ enabled, enableInput, doPrediction }: Props) {
    return (
        <>
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
        </>
    );
}
