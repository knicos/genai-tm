import React, { useState, useCallback, useEffect, useRef, RefObject } from 'react';
import style from './style.module.css';
import { VerticalButton } from '../../components/button/Button';
import randomId from '../../util/randomId';
import Sample, { SampleState } from '../../components/ImageGrid/Sample';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useTranslation } from 'react-i18next';
import { useDrop } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';
import AlertModal from '../../components/AlertModal';
import { canvasesFromFiles, canvasFromDataTransfer, Webcam } from '@genai-fi/base';
import { useSetAtom } from 'jotai';
import { fatalWebcam } from '@genaitm/state';
import { usePeerSender, usePeerStatus } from '@genai-fi/base/hooks/peer';
import { EventProtocol } from '@genaitm/components/PeerDeployer/events';

export function SampleProtocol() {
    const [samples, setSamples] = useState<SampleState[]>([]);
    const [capturing, setCapturing] = useState(false);
    const [, setLoading] = useState(false);
    const [showDropError, setShowDropError] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    const { t } = useTranslation();
    const setFatal = useSetAtom(fatalWebcam);

    const sender = usePeerSender<EventProtocol>();

    const doCapture = useCallback(
        (img: HTMLCanvasElement) => {
            const id = randomId(16);
            setSamples((old) => [{ data: img, id, state: 'pending' }, ...old]);
            if (sender) {
                sender({ event: 'add_sample', data: img.toDataURL(), index: -1, id });
            } else {
                console.warn('No sample sender');
            }
        },
        [setSamples, sender]
    );

    const onFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            canvasesFromFiles(Array.from(e.target.files || [])).then((canvases) => {
                const newSamples = canvases.map(
                    (c) => ({ data: c, id: randomId(16), state: 'pending' } as SampleState)
                );
                setSamples(newSamples);
                if (sender) {
                    newSamples.forEach((s) => {
                        sender({ event: 'add_sample', data: s.data.toDataURL(), index: -1, id: s.id });
                    });
                } else {
                    console.warn('No sample sender');
                }
            });
            e.target.value = '';
        },
        [sender, setSamples]
    );

    const [, drop] = useDrop(
        {
            accept: [NativeTypes.URL, NativeTypes.HTML, NativeTypes.FILE],
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            async drop(items: any) {
                setLoading(true);
                try {
                    const canvases = await canvasFromDataTransfer(items);

                    if (canvases.length > 0) {
                        const newSamples = canvases.map(
                            (c) => ({ data: c, id: randomId(16), state: 'pending' } as SampleState)
                        );
                        setSamples((old) => [...newSamples, ...old]);
                        if (sender) {
                            newSamples.forEach((s) => {
                                sender({ event: 'add_sample', data: s.data.toDataURL(), index: -1, id: s.id });
                            });
                        } else {
                            console.warn('No sample sender');
                        }
                    } else {
                        setShowDropError(true);
                    }
                } catch (e: unknown) {
                    setShowDropError(true);
                    console.error('Error processing drop:', e);
                }
                setLoading(false);
            },
            collect(monitor) {
                const can = monitor.canDrop();
                return {
                    highlighted: can,
                    hovered: monitor.isOver(),
                };
            },
        },
        [setSamples, sender, setShowDropError]
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

    const connected = usePeerStatus() === 'ready';

    const doDropErrorClose = useCallback(() => setShowDropError(false), [setShowDropError]);

    const doFatal = useCallback(() => setFatal(true), [setFatal]);

    return (
        <main
            className={style.main}
            ref={drop as unknown as RefObject<HTMLDivElement>}
        >
            <header>
                <h1>{t('testInput.title')}</h1>
            </header>
            <AlertModal
                open={showDropError}
                onClose={doDropErrorClose}
                severity="error"
            >
                {t('collect.dropError')}
            </AlertModal>
            <div className={style.sampleContainer}>
                <Sample
                    image={samples[0]?.data}
                    index={0}
                    status="added"
                />
            </div>
            <div className={style.capture}>
                <input
                    hidden
                    type="file"
                    ref={fileRef}
                    accept="image/*"
                    onChange={onFileChange}
                    multiple
                />
                <div className={!connected ? style.webcamDisabled : style.webcam}>
                    <Webcam
                        size={224}
                        interval={200}
                        onCapture={doCapture}
                        capture={capturing}
                        disable={!connected}
                        onFatal={doFatal}
                    />
                </div>
                <div className={style.column}>
                    <VerticalButton
                        data-testid="webcambutton"
                        variant="outlined"
                        startIcon={<UploadFileIcon />}
                        onClick={doUploadClick}
                        disabled={!connected}
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
                        disabled={!connected}
                    >
                        <div className={style.buttonCircleOuter}>
                            <div className={capturing ? style.buttonCircleActive : style.buttonCircleInner} />
                        </div>
                    </button>
                </div>
            </div>
        </main>
    );
}
