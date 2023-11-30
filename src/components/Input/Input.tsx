import React, { useState, useCallback, useRef, useEffect } from 'react';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { Widget } from '../widget/Widget';
import style from './Input.module.css';
import { useTranslation } from 'react-i18next';
import { useVariant } from '../../util/variant';
import Skeleton from '@mui/material/Skeleton';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { canvasFromDataTransfer, canvasesFromFiles } from '../../util/canvas';
import { Button } from '../button/Button';
import { useDrop } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';
import TabPanel from './TabPanel';
import WebcamInput from './WebcamInput';
import { useTabActive } from '../../util/useTabActive';
import AlertModal from '../AlertModal/AlertModal';
import { useTeachableModel } from '../../util/TeachableModel';
import { inputImage, p2pActive, sessionCode, sharingActive } from '../../state';
import { useRecoilValue, useRecoilState } from 'recoil';
import BusyButton from '../BusyButton/BusyButton';
import QRCode from '../QRCode/QRCode';

interface Props {
    disabled?: boolean;
    hidden?: boolean;
}

export default function Input(props: Props) {
    const { namespace, enableFileInput } = useVariant();
    const { t, i18n } = useTranslation(namespace);
    const [enableInputSwitch, setEnableInput] = useState(true);
    const [tabIndex, setTabIndex] = useState(0);
    const fileRef = useRef<HTMLInputElement>(null);
    const fileImageRef = useRef<HTMLDivElement>(null);
    const remoteImageRef = useRef<HTMLDivElement>(null);
    const [file, setFile] = useState<HTMLCanvasElement | null>(null);
    const isActive = useTabActive();
    const [showDropError, setShowDropError] = useState(false);
    const { predict, canPredict, draw, imageSize } = useTeachableModel();
    const [remoteInput, setRemoteInput] = useRecoilState(inputImage);
    const code = useRecoilValue(sessionCode);
    const sharing = useRecoilValue(sharingActive);
    const [p2penabled, setP2PEnabled] = useRecoilState(p2pActive);

    const enableInput = isActive && enableInputSwitch;

    const doCollab = useCallback(() => {
        setP2PEnabled(true);
    }, [setP2PEnabled]);

    const doChangeTab = useCallback(
        (_: React.SyntheticEvent, newValue: number) => {
            setTabIndex(newValue);
            setFile(null);
            setRemoteInput(null);
        },
        [setTabIndex, setRemoteInput]
    );

    useEffect(() => {
        if (fileImageRef.current && file) {
            while (fileImageRef.current.firstChild) {
                fileImageRef.current.removeChild(fileImageRef.current.firstChild);
            }
            fileImageRef.current.appendChild(file);
        }
    }, [file, fileImageRef.current]);

    useEffect(() => {
        if (remoteImageRef.current && remoteInput) {
            while (remoteImageRef.current.firstChild) {
                remoteImageRef.current.removeChild(remoteImageRef.current.firstChild);
            }
            remoteImageRef.current.appendChild(remoteInput);
        }
    }, [remoteInput, remoteImageRef.current]);

    const doPrediction = useCallback(
        async (image: HTMLCanvasElement) => {
            if (canPredict) {
                predict(image);
            }
        },
        [canPredict, predict]
    );

    useEffect(() => {
        if (tabIndex === 2 && remoteInput) {
            doPrediction(remoteInput);
        } else if (file) {
            doPrediction(file);
        }
    }, [tabIndex, remoteInput, file, doPrediction]);

    const [dropProps, drop] = useDrop({
        accept: [NativeTypes.FILE, NativeTypes.URL, NativeTypes.HTML],
        async drop(items: any) {
            const canvases = await canvasFromDataTransfer(items);

            if (canvases.length === 0) {
                setShowDropError(true);
            } else {
                setTabIndex(1);
                setFile(canvases[0]);
            }
        },
        collect(monitor) {
            const can = monitor.canDrop();
            return {
                highlighted: can,
                hovered: monitor.isOver(),
            };
        },
    });

    const changeWebcamToggle = useCallback(
        (_: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
            setEnableInput(checked);
        },
        [setEnableInput]
    );

    const doUploadClick = useCallback(() => fileRef.current?.click(), []);

    const onFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            canvasesFromFiles(Array.from(e.target.files || [])).then((canvases) => {
                if (canvases.length === 0) {
                    setShowDropError(true);
                } else {
                    setTabIndex(1);
                    setFile(canvases[0]);
                }
            });
            e.target.value = '';
        },
        [setShowDropError, setTabIndex, setFile]
    );

    const doPostProcess = useCallback(
        (image: HTMLCanvasElement) => {
            draw(image);
        },
        [draw]
    );

    const doDropErrorClose = useCallback(() => setShowDropError(false), [setShowDropError]);

    return (
        <Widget
            active={dropProps.hovered}
            dataWidget="input"
            title={t<string>('input.labels.title')}
            menu={
                <div className={style.inputControls}>
                    <FormControlLabel
                        labelPlacement="start"
                        control={
                            <Switch
                                disabled={!canPredict}
                                checked={enableInput}
                                onChange={changeWebcamToggle}
                                data-testid="webcam-switch"
                                aria-label={t<string>('input.aria.switch')}
                            />
                        }
                        hidden
                        label={t<string>(enableInput ? 'input.labels.switchOn' : 'input.labels.switchOff')}
                    />
                </div>
            }
            {...props}
        >
            {enableFileInput && (
                <div
                    className={style.container}
                    ref={drop}
                >
                    <Tabs
                        value={tabIndex}
                        onChange={doChangeTab}
                        aria-label="input source tabs"
                        variant="fullWidth"
                    >
                        <Tab
                            disabled={!canPredict}
                            label={t<string>('input.labels.webcam')}
                            id="input-tab-0"
                            aria-controls="input-panel-0"
                        />
                        <Tab
                            disabled={!canPredict}
                            label={t<string>('input.labels.file')}
                            id="input-tab-1"
                            aria-controls="input-panel-1"
                        />
                        <Tab
                            disabled={!canPredict}
                            label={t<string>('input.labels.device')}
                            id="input-tab-2"
                            aria-controls="input-panel-2"
                        />
                    </Tabs>
                    <TabPanel
                        value={tabIndex}
                        index={0}
                        enabled={enableInput}
                    >
                        <WebcamInput
                            enabled={canPredict}
                            enableInput={enableInput && tabIndex === 0}
                            doPrediction={doPrediction}
                            doPostProcess={doPostProcess}
                            size={imageSize}
                        />
                    </TabPanel>
                    <TabPanel
                        value={tabIndex}
                        index={1}
                        enabled={enableInput}
                    >
                        <input
                            type="file"
                            hidden
                            onChange={onFileChange}
                            accept="image/*"
                            ref={fileRef}
                        />
                        <Button
                            className={dropProps.hovered ? style.filesButtonHighlight : style.filesButton}
                            onClick={doUploadClick}
                            disabled={!canPredict || !enableInput}
                            startIcon={<UploadFileIcon fontSize="large" />}
                            variant="outlined"
                        >
                            {t('input.labels.upload')}
                        </Button>
                        {!!file && (
                            <div
                                role="img"
                                aria-label={t<string>('input.aria.imageFile')}
                                ref={fileImageRef}
                                className={style.fileImage}
                            />
                        )}
                        {!file && (
                            <Skeleton
                                sx={{ marginTop: '1rem' }}
                                variant="rounded"
                                width={imageSize}
                                height={imageSize}
                            />
                        )}
                    </TabPanel>
                    <TabPanel
                        value={tabIndex}
                        index={2}
                        enabled={enableInput}
                    >
                        <div className={style.qrcode}>
                            {!sharing && (
                                <BusyButton
                                    busy={p2penabled && !sharing}
                                    onClick={doCollab}
                                    variant="contained"
                                    style={{ margin: '1rem 0' }}
                                >
                                    {t('trainingdata.actions.collaborate')}
                                </BusyButton>
                            )}
                            {sharing && (
                                <QRCode
                                    size="small"
                                    url={`${window.location.origin}/input/${code}?lng=${i18n.language}`}
                                />
                            )}
                        </div>
                        {!!remoteInput && (
                            <div
                                role="img"
                                aria-label={t<string>('input.aria.imageFile')}
                                ref={remoteImageRef}
                                className={style.fileImage}
                            />
                        )}
                        {!remoteInput && (
                            <Skeleton
                                sx={{ marginTop: '1rem' }}
                                variant="rounded"
                                width={imageSize}
                                height={imageSize}
                            />
                        )}
                    </TabPanel>
                </div>
            )}
            {!enableFileInput && (
                <div className={style.container}>
                    <div className={enableInput ? style.inputContainer : style.inputContainerDisable}>
                        <WebcamInput
                            size={imageSize}
                            enabled={canPredict}
                            enableInput={enableInput}
                            doPrediction={doPrediction}
                            doPostProcess={doPostProcess}
                        />
                    </div>
                </div>
            )}
            <AlertModal
                open={showDropError}
                onClose={doDropErrorClose}
                severity="error"
            >
                {t('trainingdata.labels.dropError')}
            </AlertModal>
        </Widget>
    );
}
