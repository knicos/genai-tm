import React, { useState, useCallback, useRef, useEffect } from 'react';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import style from './Input.module.css';
import { useTranslation } from 'react-i18next';
import { useVariant } from '@genaitm/util/variant';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import TabPanel from './TabPanel';
import WebcamInput from './WebcamInput';
import { useTabActive } from '@genaitm/util/useTabActive';
import { useTeachableModel } from '@genaitm/util/TeachableModel';
import { enableCamInput, fatalWebcam, inputImage, modelTraining, poseDetected as poseDetectedAtom } from '../../state';
import { useAtomValue, useAtom, useSetAtom } from 'jotai';
import { Widget } from '@genai-fi/base';
import { AudioExample } from '@genai-fi/classifier';
import FileInput from './FileInput';
import AudioInput from '@genaitm/components/AudioExampleRecorder/AudioInput';
import RemoteInput from './RemoteInput';
import DatasetInput from './DatasetInput';

interface Props {
    disabled?: boolean;
    hidden?: boolean;
}

export default function Input(props: Props) {
    const { namespace, enableFileInput, sampleDatasets, modelVariant } = useVariant();
    const { t } = useTranslation(namespace);
    const [enableInputSwitch, setEnableInput] = useAtom(enableCamInput);
    const [tabIndex, setTabIndex] = useState(0);
    const [file, setFile] = useState<HTMLCanvasElement | AudioExample | null>(null);
    const isActive = useTabActive();
    const { model, predict, canPredict, draw, imageSize } = useTeachableModel();
    const predicting = useRef(false);
    const [remoteInput, setRemoteInput] = useAtom(inputImage);
    const fatal = useAtomValue(fatalWebcam);
    const training = useAtomValue(modelTraining);

    const enableInput = isActive && enableInputSwitch && !training;

    const isPoseLikeModel = modelVariant === 'pose' || modelVariant === 'hand';
    const [targetSize, setTargetSize] = useState(imageSize);
    const isAudio = modelVariant === 'speech';

    const setPoseDetected = useSetAtom(poseDetectedAtom);

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

    const doChangeTab = useCallback(
        (_: React.SyntheticEvent, newValue: number) => {
            setTabIndex(newValue);
            setFile(null);
            setRemoteInput(null);
            setPoseDetected(null);
        },
        [setTabIndex, setRemoteInput, setPoseDetected]
    );

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
                            <RemoteInput />
                        </TabPanel>
                    )}
                    {sampleDatasets && !isAudio && (
                        <TabPanel
                            value={tabIndex}
                            index={3}
                            enabled={enableInput}
                        >
                            <DatasetInput
                                example={file ?? undefined}
                                onExample={setFile}
                                enableInput={enableInput && tabIndex === 3}
                            />
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
        </Widget>
    );
}
