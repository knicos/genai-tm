import { useState, useCallback, useRef, useEffect, RefObject } from 'react';
// import SettingsIcon from '@mui/icons-material/Settings';
import { Button } from '@genaitm/components/button/Button';
import style from './classification.module.css';
import { useTranslation } from 'react-i18next';
import { useVariant } from '../../util/variant';
import { useTeachableModel } from '../../util/TeachableModel';
import { useAtom, useAtomValue } from 'jotai';
import { fatalWebcam, modelLoaded } from '@genaitm/state';
import { Spinner, Webcam } from '@genai-fi/base';
import CapturePanel from '@genaitm/components/CapturePanel/CapturePanel';
import { createModelOverlayPreviews } from './sampleCanvas';

interface Props {
    visible?: boolean;
    onClose: () => void;
    onCapture: (image: HTMLCanvasElement, preview?: HTMLCanvasElement, fullPreview?: HTMLCanvasElement) => void;
}

export default function WebcamCapture({ visible, onCapture, onClose }: Props) {
    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);
    const [capturing, setCapturing] = useState(false);
    const [fatal, setFatal] = useAtom(fatalWebcam);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const { draw, imageSize, model, variant } = useTeachableModel();
    const loaded = useAtomValue(modelLoaded);

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

    useEffect(() => {
        if (fatal) onClose();
    }, [fatal, onClose]);

    const doFatal = useCallback(() => setFatal(true), [setFatal]);

    const handleCapture = useCallback(
        async (image: HTMLCanvasElement) => {
            if ((variant !== 'hand' && variant !== 'pose') || !model) {
                onCapture(image);
                return;
            }

            const { preview, fullPreview } = await createModelOverlayPreviews(image, model, variant, false);
            onCapture(image, preview, fullPreview);
        },
        [model, onCapture, variant]
    );

    return visible ? (
        <CapturePanel
            title={t('trainingdata.actions.webcam')}
            onClose={onClose}
        >
            <div
                className={style.webcamcontainer}
                data-testid="webcamwindow"
            >
                <Webcam
                    capture={capturing}
                    onCapture={handleCapture}
                    interval={200}
                    onPostprocess={draw}
                    size={imageSize}
                    onFatal={doFatal}
                />
            </div>
            <div className={style.webcambuttoncontainer}>
                <Button
                    ref={buttonRef as RefObject<HTMLButtonElement>}
                    sx={{ flexGrow: 1 }}
                    variant="contained"
                    onMouseDown={startCapture}
                    onMouseUp={stopCapture}
                    onBlur={stopCapture}
                    onMouseLeave={stopCapture}
                    onTouchEnd={stopCapture}
                    onTouchCancel={stopCapture}
                    aria-pressed={capturing}
                >
                    {capturing ? t('trainingdata.labels.wait') : t('trainingdata.actions.capture', { seconds: '1' })}
                </Button>
                {/*<IconButton aria-label="settings" onClick={() => setShowSettings(true)} color="primary">
                        <SettingsIcon />
                    </IconButton>*/}
            </div>
            {!loaded && (
                <div className={style.loadingOverlay}>
                    <Spinner />
                    <div className={style.loadingText}>{t('training.labels.loading')}</div>
                </div>
            )}
        </CapturePanel>
    ) : null;
}
