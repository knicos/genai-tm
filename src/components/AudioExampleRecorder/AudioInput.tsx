import { useEffect, useRef, useState } from 'react';
import Clock from './Clock';
import { AudioExample, RecordingProgress, SoundRecorder } from '@genai-fi/classifier';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import style from './style.module.css';
import { IconButton } from '@mui/material';
import MicSelect from './MicSelect';

interface Props {
    onExample: (example: AudioExample, timestamp: number) => void;
    blob?: Blob;
    label?: string;
    duration?: number;
    includeCanvas?: boolean;
    includeRawAudio?: boolean;
    recording: boolean;
    onStop?: () => void;
    showDuration?: boolean;
    allowReplay?: boolean;
    showMicSelect?: boolean;
}

export default function AudioInput({
    onExample,
    blob,
    label,
    duration,
    includeCanvas = true,
    includeRawAudio = true,
    recording,
    showDuration = true,
    allowReplay = false,
    showMicSelect = true,
    onStop,
}: Props) {
    const outputCanvas = useRef<HTMLCanvasElement>(null);
    const canvContainer = useRef<HTMLDivElement>(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [allowPlay, setAllowPlay] = useState(false);
    const [selectedDeviceId, setSelectedDeviceId] = useState<string | undefined>();

    const active = recording && (!allowReplay || allowPlay);

    useEffect(() => {
        if (active) {
            const recorder = new SoundRecorder();
            recorder.on('example', (example) => {
                onExample(example, 0);
            });
            recorder.on('update', (prog: RecordingProgress) => {
                setElapsedTime(prog.elapsedTimeMillis ?? 0);
            });
            recorder.on('stop', () => {
                if (onStop) {
                    onStop();
                }
                setAllowPlay(false);
            });
            recorder.on('error', () => {
                if (onStop) {
                    onStop();
                }
                setAllowPlay(false);
            });

            recorder.canvas = outputCanvas.current;

            recorder
                .startRecording(
                    label ?? '',
                    {
                        durationMillis: duration,
                        sampleRateHz: 44100,
                        frameSize: 1024,
                        columnTruncateLength: 232,
                        includeRawAudio: includeRawAudio,
                        includeCanvas: includeCanvas,
                        warmupMillis: 200,
                        deviceId: selectedDeviceId,
                    },
                    blob ?? undefined
                )
                .then(() => {
                    setAllowPlay(true);
                });

            return () => {
                recorder.stopRecording();
                recorder.removeAllListeners();
            };
        }
    }, [active, label, blob, duration, includeCanvas, includeRawAudio, onStop, onExample, selectedDeviceId]);

    return (
        <>
            {showMicSelect && !blob && (
                <MicSelect
                    deviceId={selectedDeviceId}
                    onSelect={setSelectedDeviceId}
                />
            )}
            <div
                className={style.canvasContainer}
                ref={canvContainer}
            >
                <canvas
                    ref={outputCanvas}
                    width={200}
                    height={58}
                    aria-hidden={true}
                />
                <div className={style.overlay} />
                {blob && allowReplay && (
                    <IconButton onClick={() => setAllowPlay((old) => !old)}>
                        {!allowPlay ? <PlayArrowIcon fontSize="large" /> : <StopIcon fontSize="large" />}
                    </IconButton>
                )}
            </div>
            {showDuration && <Clock duration={elapsedTime} />}
        </>
    );
}
