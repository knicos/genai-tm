import React, { useState, useCallback, useRef, useEffect, RefObject } from 'react';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import style from './Input.module.css';
import { useTranslation } from 'react-i18next';
import { useVariant } from '@genaitm/util/variant';
import Skeleton from '@mui/material/Skeleton';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import GridViewIcon from '@mui/icons-material/GridView';
import { Button } from '@genaitm/components/button/Button';
import { useDrop } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';
import TabPanel from './TabPanel';
import WebcamInput from './WebcamInput';
import DatasetTestPicker from '@genaitm/components/DatasetTestPicker/DatasetTestPicker';
import { useTabActive } from '@genaitm/util/useTabActive';
import AlertModal from '@genaitm/components/AlertModal';
import { useTeachableModel } from '@genaitm/util/TeachableModel';
import {
    enableCamInput,
    fatalWebcam,
    inputImage,
    modelTraining,
    p2pActive,
    sessionCode,
    sharingActive,
} from '../../state';
import { useAtomValue, useAtom } from 'jotai';
import { BusyButton, canvasesFromFiles, canvasFromDataTransfer, QRCode, Widget } from '@genai-fi/base';

interface Props {
    disabled?: boolean;
    hidden?: boolean;
}

export default function Input(props: Props) {
    const { namespace, enableFileInput, sampleDatasets, modelVariant } = useVariant();
    const { t, i18n } = useTranslation(namespace);
    const [enableInputSwitch, setEnableInput] = useAtom(enableCamInput);
    const [tabIndex, setTabIndex] = useState(0);
    const fileRef = useRef<HTMLInputElement>(null);
    const fileImageRef = useRef<HTMLDivElement>(null);
    const remoteImageRef = useRef<HTMLDivElement>(null);
    const [file, setFile] = useState<HTMLCanvasElement | null>(null);
    const [showDatasetPicker, setShowDatasetPicker] = useState(false);
    const isActive = useTabActive();
    const [showDropError, setShowDropError] = useState(false);
    const { predict, canPredict, draw, imageSize } = useTeachableModel();
    const [remoteInput, setRemoteInput] = useAtom(inputImage);
    const code = useAtomValue(sessionCode);
    const sharing = useAtomValue(sharingActive);
    const [p2penabled, setP2PEnabled] = useAtom(p2pActive);
    const fatal = useAtomValue(fatalWebcam);
    const training = useAtomValue(modelTraining);

    const enableInput = isActive && enableInputSwitch && !training;

    useEffect(() => {
        if (fatal) setTabIndex(1);
    }, [fatal]);

    // Reset all local input state when the model variant changes (e.g. image <-> pose)
    useEffect(() => {
        setFile(null);
        setTabIndex(0);
        setRemoteInput(null);
    }, [modelVariant]);

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    const handleDatasetImageSelected = useCallback(
        (canvas: HTMLCanvasElement) => {
            // Reset canvas styling to display at full size for prediction
            canvas.style.width = `${imageSize}px`;
            canvas.style.height = `${imageSize}px`;
            setTabIndex(3);
            setFile(canvas);
        },
        [imageSize]
    );

    const handleDatasetPickerOpen = useCallback(() => {
        setShowDatasetPicker(true);
    }, []);

    const handleDatasetPickerClose = useCallback(() => {
        setShowDatasetPicker(false);
    }, []);

    return (
        <Widget
            noPadding
            active={dropProps.hovered}
            dataWidget="input"
            activated={enableInput}
            title={t('input.labels.title')}
            menu={
                <div className={style.inputControls}>
                    <FormControlLabel
                        labelPlacement="start"
                        control={
                            <Switch
                                disabled={!canPredict || training}
                                checked={enableInput}
                                onChange={changeWebcamToggle}
                                data-testid="webcam-switch"
                                aria-label={t('input.aria.switch')}
                                color="error"
                            />
                        }
                        hidden
                        label={t(enableInput ? 'input.labels.switchOn' : 'input.labels.switchOff')}
                    />
                </div>
            }
            {...props}
        >
            {enableFileInput && (
                <div
                    className={style.container}
                    data-variant={modelVariant}
                    ref={drop as unknown as RefObject<HTMLDivElement>}
                >
                    <div className={style.tabsRow}>
                        <Tabs
                            value={tabIndex}
                            onChange={doChangeTab}
                            aria-label="input source tabs"
                            variant="scrollable"
                            scrollButtons="auto"
                            allowScrollButtonsMobile
                        >
                            <Tab
                                disabled={!canPredict || fatal}
                                label={t('input.labels.webcam')}
                                id="input-tab-0"
                                aria-controls="input-panel-0"
                                value={0}
                            />
                            <Tab
                                disabled={!canPredict}
                                label={t('input.labels.file')}
                                id="input-tab-1"
                                aria-controls="input-panel-1"
                                value={1}
                            />
                            <Tab
                                disabled={!canPredict || fatal}
                                label={t('input.labels.device')}
                                id="input-tab-2"
                                aria-controls="input-panel-2"
                                value={2}
                            />
                            {sampleDatasets && (
                                <Tab
                                    disabled={!canPredict}
                                    className={style.datasetTab}
                                    label={t('input.labels.dataset')}
                                    id="input-tab-3"
                                    aria-controls="input-panel-3"
                                    value={3}
                                />
                            )}
                        </Tabs>

                        
                    </div>
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
                        <div className={style.fileActionsRow}>
                            <Button
                                className={dropProps.hovered ? style.filesButtonHighlight : style.filesButton}
                                onClick={doUploadClick}
                                disabled={!canPredict || !enableInput}
                                startIcon={<UploadFileIcon fontSize="large" />}
                                variant="outlined"
                            >
                                {t('input.labels.upload')}
                            </Button>
                        </div>
                        {!!file && (
                            <div
                                role="img"
                                aria-label={t('input.aria.imageFile')}
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
                                    dialog
                                    size="small"
                                    url={`${window.location.origin}/input/${code}?lng=${i18n.language}`}
                                />
                            )}
                        </div>
                        {!!remoteInput && (
                            <div
                                role="img"
                                aria-label={t('input.aria.imageFile')}
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
                    {sampleDatasets && (
                        <TabPanel
                            value={tabIndex}
                            index={3}
                            enabled={enableInput}
                        >
                            <div className={style.datasetActionsRow}>
                                <Button
                                    onClick={handleDatasetPickerOpen}
                                    disabled={!canPredict || !enableInput}
                                    startIcon={<GridViewIcon fontSize="large" />}
                                    variant="outlined"
                                >
                                    {t('trainingdata.labels.selectDataset')}
                                </Button>
                            </div>
                            {!!file && (
                                <div
                                    role="img"
                                    aria-label={t('input.aria.imageFile')}
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
                    )}
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
            {sampleDatasets && (
                <DatasetTestPicker
                    open={showDatasetPicker}
                    onClose={handleDatasetPickerClose}
                    onImageSelected={handleDatasetImageSelected}
                />
            )}
        </Widget>
    );
}
