import React, { useState, useCallback, useRef, useEffect } from 'react';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { Widget } from '../widget/Widget';
import style from './Input.module.css';
import { useTranslation } from 'react-i18next';
import { useVariant } from '../../util/variant';
import { Skeleton } from '@mui/material';
import { useRecoilState } from 'recoil';
import { predictedIndex, prediction } from '../../state';
import { TeachableMobileNet } from '@teachablemachine/image';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { canvasFromFile } from '../../util/canvas';
import { Button } from '../button/Button';
import { useDrop } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';
import TabPanel from './TabPanel';
import WebcamInput from './WebcamInput';

interface Props {
    disabled?: boolean;
    hidden?: boolean;
    enabled?: boolean;
    model?: TeachableMobileNet;
}

export default function Input({ enabled, model, ...props }: Props) {
    const { namespace, enableFileInput } = useVariant();
    const { t } = useTranslation(namespace);
    const [enableInput, setEnableInput] = useState(true);
    const [tabIndex, setTabIndex] = useState(0);
    const [, setPredictions] = useRecoilState(prediction);
    const [, setPredictionIndex] = useRecoilState(predictedIndex);
    const fileRef = useRef<HTMLInputElement>(null);
    const fileImageRef = useRef<HTMLDivElement>(null);
    const [file, setFile] = useState<HTMLCanvasElement | null>(null);

    const doChangeTab = useCallback(
        (event: React.SyntheticEvent, newValue: number) => {
            setTabIndex(newValue);
            setFile(null);
        },
        [setTabIndex]
    );

    useEffect(() => {
        if (fileImageRef.current && file) {
            while (fileImageRef.current.firstChild) {
                fileImageRef.current.removeChild(fileImageRef.current.firstChild);
            }
            fileImageRef.current.appendChild(file);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [file, fileImageRef.current]);

    const doPrediction = useCallback(
        async (image: HTMLCanvasElement) => {
            if (model) {
                const p = await model.predict(image);
                setPredictions(p);

                const nameOfMax = p.reduce((prev, val) => (val.probability > prev.probability ? val : prev));
                setPredictionIndex(p.indexOf(nameOfMax));
            }
        },
        [setPredictions, setPredictionIndex, model]
    );

    const onDrop = useCallback(
        async (acceptedFiles: File[]) => {
            if (acceptedFiles.length === 1) {
                const newCanvas = await canvasFromFile(acceptedFiles[0]);
                doPrediction(newCanvas);
                setFile(newCanvas);
            }
        },
        [doPrediction]
    );

    const [dropProps, drop] = useDrop({
        accept: [NativeTypes.FILE, NativeTypes.URL],
        drop(items: any) {
            onDrop(items.files);
        },
        canDrop(item: any) {
            if (item?.files) {
                for (const i of item?.files) {
                    if (!i.type.startsWith('image/')) {
                        return false;
                    }
                }
                return true;
            } else {
                return false;
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
        (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
            setEnableInput(checked);
        },
        [setEnableInput]
    );

    const doUploadClick = useCallback(() => fileRef.current?.click(), []);

    const onFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            onDrop(Array.from(e.target.files || []));
        },
        [onDrop]
    );

    return (
        <Widget
            dataWidget="input"
            title={t<string>('input.labels.title')}
            menu={
                <div className={style.inputControls}>
                    <FormControlLabel
                        labelPlacement="start"
                        control={
                            <Switch
                                disabled={!enabled}
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
                <div className={style.container}>
                    <Tabs
                        value={tabIndex}
                        onChange={doChangeTab}
                        aria-label="input source tabs"
                        variant="fullWidth"
                    >
                        <Tab
                            disabled={!enabled}
                            label={t<string>('input.labels.webcam')}
                            id="input-tab-0"
                            aria-controls="input-panel-0"
                        />
                        <Tab
                            disabled={!enabled}
                            label={t<string>('input.labels.file')}
                            id="input-tab-1"
                            aria-controls="input-panel-1"
                        />
                    </Tabs>
                    <TabPanel
                        value={tabIndex}
                        index={0}
                        enabled={enableInput}
                    >
                        <WebcamInput
                            enabled={enabled}
                            enableInput={enableInput}
                            doPrediction={doPrediction}
                        />
                    </TabPanel>
                    <TabPanel
                        value={tabIndex}
                        index={1}
                        enabled={enableInput}
                        ref={drop}
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
                            disabled={!enabled || !enableInput}
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
                                width={224}
                                height={224}
                            />
                        )}
                    </TabPanel>
                </div>
            )}
            {!enableFileInput && (
                <div className={style.container}>
                    <div className={enableInput ? style.inputContainer : style.inputContainerDisable}>
                        <WebcamInput
                            enabled={enabled}
                            enableInput={enableInput}
                            doPrediction={doPrediction}
                        />
                    </div>
                </div>
            )}
        </Widget>
    );
}
