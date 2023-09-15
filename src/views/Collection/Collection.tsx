import React, { useState, useCallback, useEffect, useRef } from 'react';
import style from './style.module.css';
import { useParams } from 'react-router-dom';
import { Webcam } from '../../components/webcam/Webcam';
import { VerticalButton } from '../../components/button/Button';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../../style/theme';
import { usePeerSender } from './usePeerSender';
import randomId from '../../util/randomId';
import { SampleState, SampleStateValue } from '../../components/ImageGrid/Sample';
import ImageGrid from '../../components/ImageGrid/ImageGrid';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { canvasesFromFiles } from '../../util/canvas';
import { useTranslation } from 'react-i18next';

export function Component() {
    const { code, classIndex } = useParams();
    const [samples, setSamples] = useState<SampleState[]>([]);
    const [capturing, setCapturing] = useState(false);
    const [count, setCount] = useState(0);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    const { t } = useTranslation();

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
            if (samples.length > index) {
                setSamples((old) => old.filter((o) => o.state !== 'added' || samples[index].has(o.id)));
                setCount(samples[index].size);
            }
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

    const onFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            canvasesFromFiles(Array.from(e.target.files || [])).then((canvases) => {
                const newSamples = canvases.map(
                    (c) => ({ data: c, id: randomId(16), state: 'pending' } as SampleState)
                );
                setSamples((old) => [...newSamples, ...old]);
                if (sender) {
                    newSamples.forEach((s) => {
                        sender(s.data, index, s.id);
                    });
                } else {
                    console.warn('No sample sender');
                }
            });
            e.target.value = '';
        },
        [sender, setSamples, index]
    );

    const doUploadClick = useCallback(() => fileRef.current?.click(), []);

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
                            ? t('collect.disconnected')
                            : t('collect.connecting')}
                    </h1>
                    <div className={style.sampleCount}>{t('collect.sampleCount', { count })}</div>
                </header>
                <ImageGrid
                    samples={samples}
                    onDelete={doDelete}
                />
                <div className={style.capture}>
                    <input
                        hidden
                        type="file"
                        ref={fileRef}
                        accept="image/*"
                        onChange={onFileChange}
                        multiple
                    />
                    <div className={style.webcam}>
                        <Webcam
                            size={224}
                            interval={200}
                            onCapture={doCapture}
                            capture={capturing}
                            disable={state !== 'connected'}
                        />
                    </div>
                    <div className={style.column}>
                        <VerticalButton
                            data-testid="webcambutton"
                            variant="outlined"
                            startIcon={<UploadFileIcon />}
                            onClick={doUploadClick}
                        >
                            {t('collect.actions.upload')}
                        </VerticalButton>
                        <button
                            className={style.recordButton}
                            ref={buttonRef}
                            onMouseDown={startCapture}
                            onMouseUp={stopCapture}
                            onBlur={stopCapture}
                            onMouseLeave={stopCapture}
                            onTouchEnd={stopCapture}
                            onTouchCancel={stopCapture}
                        >
                            <div className={style.buttonCircleOuter}>
                                <div className={capturing ? style.buttonCircleActive : style.buttonCircleInner} />
                            </div>
                        </button>
                    </div>
                </div>
            </main>
        </ThemeProvider>
    );
}
