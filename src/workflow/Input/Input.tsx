import React, { useState, useCallback, useRef, useEffect } from 'react';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import style from './Input.module.css';
import { useTranslation } from 'react-i18next';
import { useVariant } from '@genaitm/util/variant';
import Skeleton from '@mui/material/Skeleton';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import GridViewIcon from '@mui/icons-material/GridView';
import { Button } from '@genaitm/components/button/Button';
import TabPanel from './TabPanel';
import WebcamInput from './WebcamInput';
import DatasetTestPicker from '@genaitm/components/DatasetTestPicker/DatasetTestPicker';
import { useTabActive } from '@genaitm/util/useTabActive';
import { useTeachableModel } from '@genaitm/util/TeachableModel';
import {
    enableCamInput,
    fatalWebcam,
    inputImage,
    modelTraining,
    p2pActive,
    sessionCode,
    sharingActive,
    poseDetected as poseDetectedAtom,
} from '../../state';
import { useAtomValue, useAtom, useSetAtom } from 'jotai';
import { BusyButton, QRCode, Widget } from '@genai-fi/base';
import { AudioExample } from '@genai-fi/classifier';
import FileInput from './FileInput';
import AudioInput from '@genaitm/components/AudioExampleRecorder/AudioInput';

interface Props {
    disabled?: boolean;
    hidden?: boolean;
}

export default function Input(props: Props) {
    const { namespace, enableFileInput, sampleDatasets, modelVariant } = useVariant();
    const { t, i18n } = useTranslation(namespace);
    const [enableInputSwitch, setEnableInput] = useAtom(enableCamInput);
    const [tabIndex, setTabIndex] = useState(0);
    const fileImageRef = useRef<HTMLDivElement>(null);
    const remoteImageRef = useRef<HTMLDivElement>(null);
    const [file, setFile] = useState<HTMLCanvasElement | AudioExample | null>(null);
    const [showDatasetPicker, setShowDatasetPicker] = useState(false);
    const isActive = useTabActive();
    const { model, predict, canPredict, draw, imageSize } = useTeachableModel();
    const predicting = useRef(false);
    const [remoteInput, setRemoteInput] = useAtom(inputImage);
    const code = useAtomValue(sessionCode);
    const sharing = useAtomValue(sharingActive);
    const [p2penabled, setP2PEnabled] = useAtom(p2pActive);
    const fatal = useAtomValue(fatalWebcam);
    const training = useAtomValue(modelTraining);

    const enableInput = isActive && enableInputSwitch && !training;

    const isPoseLikeModel = modelVariant === 'pose' || modelVariant === 'hand';
    const [targetSize, setTargetSize] = useState(imageSize);
    const isAudio = modelVariant === 'speech';

    const setPoseDetected = useSetAtom(poseDetectedAtom);

    const scaleToModelSize = useCallback(
        (canvas: HTMLCanvasElement): HTMLCanvasElement => {
            if (canvas.width === targetSize && canvas.height === targetSize) return canvas;
            const scaled = document.createElement('canvas');
            scaled.width = targetSize;
            scaled.height = targetSize;
            const ctx = scaled.getContext('2d');
            ctx?.drawImage(canvas, 0, 0, targetSize, targetSize);
            return scaled;
        },
        [targetSize]
    );

    useEffect(() => {
        if (fatal) setTabIndex(1);
    }, [fatal]);

    useEffect(() => {
        setTargetSize(imageSize);
        if (!model) return;

        const sizeFromModel = model.getImageSize();
        if (sizeFromModel > 0) {
            setTargetSize(sizeFromModel);
        }
    }, [model, imageSize, modelVariant]);

    // Reset all local input state when the model variant changes (e.g. image <-> pose)
    useEffect(() => {
        setFile(null);
        setTabIndex(0);
        setRemoteInput(null);
        setPoseDetected(null);
    }, [modelVariant, setRemoteInput, setPoseDetected]);

    const doCollab = useCallback(() => {
        setP2PEnabled(true);
    }, [setP2PEnabled]);

    const doChangeTab = useCallback(
        (_: React.SyntheticEvent, newValue: number) => {
            setTabIndex(newValue);
            setFile(null);
            setRemoteInput(null);
            setPoseDetected(null);
        },
        [setTabIndex, setRemoteInput, setPoseDetected]
    );

    useEffect(() => {
        if (remoteImageRef.current && remoteInput) {
            while (remoteImageRef.current.firstChild) {
                remoteImageRef.current.removeChild(remoteImageRef.current.firstChild);
            }
            remoteImageRef.current.appendChild(remoteInput);
        }
    }, [remoteInput]);

    const doPrediction = useCallback(
        async (image: HTMLCanvasElement | AudioExample) => {
            if (!canPredict || predicting.current) return;
            predicting.current = true;
            try {
                await predict(image);
                if (isPoseLikeModel && tabIndex !== 0 && image instanceof HTMLCanvasElement) {
                    draw(image);
                }
            } finally {
                predicting.current = false;
            }
        },
        [canPredict, predict, isPoseLikeModel, draw, tabIndex]
    );

    useEffect(() => {
        if (tabIndex === 2 && remoteInput) {
            doPrediction(remoteInput);
        } else if (file) {
            doPrediction(file);
        }
    }, [tabIndex, remoteInput, file, doPrediction]);

    const changeWebcamToggle = useCallback(
        (_: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
            setEnableInput(checked);
        },
        [setEnableInput]
    );

    const doPostProcess = useCallback(
        (image: HTMLCanvasElement) => {
            draw(image);
        },
        [draw]
    );

    const handleDatasetImageSelected = useCallback(
        (canvas: HTMLCanvasElement) => {
            setTabIndex(3);
            setFile(scaleToModelSize(canvas));
        },
        [scaleToModelSize]
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
                            {isAudio && (
                                <Tab
                                    disabled={!canPredict}
                                    label={t('input.labels.audio')}
                                    id="input-tab-0"
                                    aria-controls="input-panel-0"
                                    value={0}
                                />
                            )}
                            {!isAudio && (
                                <Tab
                                    disabled={!canPredict || fatal}
                                    label={t('input.labels.webcam')}
                                    id="input-tab-0"
                                    aria-controls="input-panel-0"
                                    value={0}
                                />
                            )}
                            <Tab
                                disabled={!canPredict}
                                label={t('input.labels.file')}
                                id="input-tab-1"
                                aria-controls="input-panel-1"
                                value={1}
                            />
                            {!isAudio && (
                                <Tab
                                    disabled={!canPredict || fatal}
                                    label={t('input.labels.device')}
                                    id="input-tab-2"
                                    aria-controls="input-panel-2"
                                    value={2}
                                />
                            )}
                            {sampleDatasets && !isAudio && (
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
                    {isAudio && (
                        <TabPanel
                            value={tabIndex}
                            index={0}
                            enabled={enableInput}
                        >
                            <AudioInput
                                recording={canPredict && enableInput && tabIndex === 0}
                                onExample={doPrediction}
                                includeCanvas={false}
                                includeRawAudio={false}
                                showDuration={false}
                            />
                        </TabPanel>
                    )}
                    {!isAudio && (
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
                                size={targetSize}
                            />
                        </TabPanel>
                    )}
                    <TabPanel
                        value={tabIndex}
                        index={1}
                        enabled={enableInput}
                    >
                        <FileInput
                            enableInput={enableInput && tabIndex === 1}
                            isAudio={isAudio}
                            onExample={setFile}
                            example={file ?? undefined}
                        />
                    </TabPanel>
                    {!isAudio && (
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
                    )}
                    {sampleDatasets && !isAudio && (
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
                            size={targetSize}
                            enabled={canPredict}
                            enableInput={enableInput}
                            doPrediction={doPrediction}
                            doPostProcess={doPostProcess}
                        />
                    </div>
                </div>
            )}
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
