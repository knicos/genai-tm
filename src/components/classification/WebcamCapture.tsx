import React, { useState, useCallback, useRef, useEffect } from 'react';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
// import SettingsIcon from '@mui/icons-material/Settings';
import { Button } from '../button/Button';
import { Webcam } from '../webcam/Webcam';
import style from './classification.module.css';
import WebcamSettings, { IWebcamSettings } from './WebcamSettings';
import { useTranslation } from 'react-i18next';
import { useVariant } from '../../util/variant';
import { useTeachableModel } from '../../util/TeachableModel';

interface Props {
    visible?: boolean;
    onClose: () => void;
    onCapture: (image: HTMLCanvasElement) => void;
}

export default function WebcamCapture({ visible, onCapture, onClose }: Props) {
    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);
    const [capturing, setCapturing] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [settings, setSettings] = useState<IWebcamSettings>({
        interval: 1,
        delay: 6,
        count: 1,
    });
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

    const doPostProcess = useCallback(
        (image: HTMLCanvasElement) => {
            draw(image);
        },
        [draw]
    );

    useEffect(() => {
        if (buttonRef.current) {
            buttonRef.current.focus();
            buttonRef.current.addEventListener('touchstart', startTouchCapture, { passive: false });
        }
    }, [buttonRef, startTouchCapture]);

    return visible ? (
        <div
            data-testid="webcamwindow"
            className={style.webcamwindow}
        >
            {showSettings ? (
                <>
                    <WebcamSettings
                        settings={settings}
                        setSettings={setSettings}
                    />
                    <div className={style.webcambuttoncontainer}>
                        <Button
                            variant="contained"
                            onClick={() => setShowSettings(false)}
                        >
                            Close
                        </Button>
                    </div>
                </>
            ) : (
                <>
                    <div className={style.webcamheader}>
                        <h2>{t('trainingdata.actions.webcam')}</h2>
                        <IconButton
                            data-testid="webcamclose"
                            aria-label={t<string>('trainingdata.aria.close')}
                            onClick={onClose}
                            color="primary"
                            size="small"
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </div>
                    <div className={style.webcamcontainer}>
                        <Webcam
                            capture={capturing}
                            onCapture={onCapture}
                            interval={200}
                            onPostprocess={doPostProcess}
                            size={imageSize}
                        />
                    </div>
                    <div className={style.webcambuttoncontainer}>
                        <Button
                            ref={buttonRef}
                            sx={{ flexGrow: 1 }}
                            variant="contained"
                            onMouseDown={startCapture}
                            onMouseUp={stopCapture}
                            onBlur={stopCapture}
                            onMouseLeave={stopCapture}
                            onTouchEnd={stopCapture}
                            onTouchCancel={stopCapture}
                        >
                            {capturing
                                ? t('trainingdata.labels.wait')
                                : t('trainingdata.actions.capture', { seconds: '1' })}
                        </Button>
                        {/*<IconButton aria-label="settings" onClick={() => setShowSettings(true)} color="primary">
                        <SettingsIcon />
                    </IconButton>*/}
                    </div>
                </>
            )}
        </div>
    ) : null;
}
