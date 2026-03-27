import { useState, useCallback, useRef, useEffect, RefObject } from 'react';
// import SettingsIcon from '@mui/icons-material/Settings';
import { Button } from '@genaitm/components/button/Button';
import style from './classification.module.css';
import { useTranslation } from 'react-i18next';
import { useVariant } from '../../util/variant';
import { useTeachableModel } from '../../util/TeachableModel';
import { useAtom } from 'jotai';
import { fatalWebcam } from '@genaitm/state';
import { Webcam } from '@genai-fi/base';
import CapturePanel from '@genaitm/components/CapturePanel/CapturePanel';

interface Props {
    visible?: boolean;
    onClose: () => void;
    onCapture: (image: HTMLCanvasElement) => void;
}

export default function WebcamCapture({ visible, onCapture, onClose }: Props) {
    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);
    const [capturing, setCapturing] = useState(false);
    const [fatal, setFatal] = useAtom(fatalWebcam);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const { draw, imageSize } = useTeachableModel();

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
                    onCapture={onCapture}
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
        </CapturePanel>
    ) : null;
}
