import React, { useState, useCallback, useEffect, useRef } from 'react';
import style from './style.module.css';
import { useParams } from 'react-router-dom';
import { Webcam } from '../../components/webcam/Webcam';
import { Button } from '../../components/button/Button';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../../style/theme';
import { usePeerSender } from './usePeerSender';
import randomId from '../../util/randomId';
import { SampleState, SampleStateValue } from '../../components/ImageGrid/Sample';
import ImageGrid from '../../components/ImageGrid/ImageGrid';

export function Component() {
    const { code, classIndex } = useParams();
    const [samples, setSamples] = useState<SampleState[]>([]);
    const [capturing, setCapturing] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const index = parseInt(classIndex || '0');

    const doError = useCallback(() => {}, []);

    const doSampleState = useCallback(
        (id: string, state: SampleStateValue) => {
            if (state === 'deleted') {
                setSamples((old) => old.filter((o) => o.id !== id));
            } else {
                setSamples((old) => old.map((o) => (o.id === id ? { data: o.data, id: o.id, state } : o)));
            }
        },
        [setSamples]
    );

    const doSamplesUpdate = useCallback(
        (samples: Set<string>[]) => {
            setSamples((old) => old.filter((o) => o.state !== 'added' || samples[index].has(o.id)));
        },
        [setSamples, index]
    );

    const { sender, deleter, state, classNames } = usePeerSender(code || '', doError, doSampleState, doSamplesUpdate);

    const doDelete = useCallback(
        (ix: number) => {
            const item = samples[ix];
            if (item && deleter) {
                setSamples((old) => old.map((o, i) => (ix === i ? { ...o, state: 'pending' } : o)));
                deleter(index, item.id);
            }
        },
        [samples, deleter, index]
    );

    const doCapture = useCallback(
        (img: HTMLCanvasElement) => {
            const id = randomId(16);
            setSamples((old) => [{ data: img, id, state: 'pending' }, ...old]);
            if (sender) {
                sender(img, index, id);
            } else {
                console.warn('No sample sender');
            }
        },
        [setSamples, sender, index]
    );

    const startCapture = useCallback(() => setCapturing(true), [setCapturing]);
    const startTouchCapture = useCallback(
        (e: TouchEvent) => {
            if (e.cancelable) {
                e.preventDefault();
                e.stopImmediatePropagation();
                setCapturing(true);
            }
        },
        [setCapturing]
    );
    const stopCapture = useCallback(() => setCapturing(false), [setCapturing]);

    useEffect(() => {
        if (buttonRef.current) {
            buttonRef.current.focus();
            buttonRef.current.addEventListener('touchstart', startTouchCapture, { passive: false });
        }
    }, [buttonRef, startTouchCapture]);

    return (
        <ThemeProvider theme={theme}>
            <main className={style.main}>
                <header>
                    <h1>
                        {state === 'connected'
                            ? classNames.length > index
                                ? classNames[index]
                                : ''
                            : state === 'disconnected'
                            ? 'Disconnected'
                            : 'Connecting...'}
                    </h1>
                </header>
                <ImageGrid
                    samples={samples}
                    onDelete={doDelete}
                />
                <div className={style.capture}>
                    <div className={style.webcam}>
                        <Webcam
                            size={224}
                            interval={200}
                            onCapture={doCapture}
                            capture={capturing}
                            disable={state !== 'connected'}
                        />
                    </div>
                    <Button
                        ref={buttonRef}
                        variant="contained"
                        onMouseDown={startCapture}
                        onMouseUp={stopCapture}
                        onBlur={stopCapture}
                        onMouseLeave={stopCapture}
                        onTouchEnd={stopCapture}
                        onTouchCancel={stopCapture}
                    >
                        Hold to Capture
                    </Button>
                </div>
            </main>
        </ThemeProvider>
    );
}
