import React, { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import style from './classification.module.css';
import { IClassification, fatalWebcam } from '@genaitm/state';
import { VerticalButton } from '@genaitm/components/button/Button';
import Sample from './Sample';
import WebcamCapture from './WebcamCapture';
import VideocamIcon from '@mui/icons-material/Videocam';
import MicIcon from '@mui/icons-material/Mic';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import WarningIcon from '@mui/icons-material/Warning';
import ClassMenu from './ClassMenu';
import { useTranslation } from 'react-i18next';
import { useDrop } from 'react-dnd';
import { useVariant } from '@genaitm/util/variant';
import { NativeTypes } from 'react-dnd-html5-backend';
import UploadIcon from '@mui/icons-material/Upload';
import AlertModal from '@genaitm/components/AlertModal';
import { useAtomValue } from 'jotai';
import { AlertPara, canvasesFromFiles, canvasFromDataTransfer, Widget } from '@genai-fi/base';
import DatasetPicker from '@genaitm/components/DatasetPicker/DatasetPicker';
import AudioExampleRecorder from '@genaitm/components/AudioExampleRecorder/AudioExampleRecorder';
import { AudioExample } from '@genai-fi/classifier';
import { validateAudioBlob } from '@genaitm/util/audio';

const SAMPLEMIN_DEFAULT = 2;
const SAMPLEMIN_AUDIO_NOISE = 20;

interface Props {
    name: string;
    active: boolean;
    onActivate: (ix: number) => void;
    onDelete: (ix: number) => void;
    data: IClassification;
    setData: (data: (old: IClassification) => IClassification, ix: number) => void;
    setActive: (active: boolean, ix: number) => void;
    index: number;
    onSampleClick?: (classIndex: number, sampleIndex: number) => void;
}

export function Classification({
    name,
    active,
    data,
    index,
    setData,
    onActivate,
    setActive,
    onDelete,
    onSampleClick,
}: Props) {
    const { namespace, sampleUploadFile, disableClassNameEdit, showDragTip, modelVariant } = useVariant();
    const { t } = useTranslation(namespace);
    const fileRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLOListElement>(null);
    const [loading, setLoading] = useState(false);
    const [showTip, setShowTip] = useState(false);
    const [showDropError, setShowDropError] = useState(false);
    const [showDatasetPicker, setShowDatasetPicker] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const fatal = useAtomValue(fatalWebcam);

    const isAudio = modelVariant === 'speech';

    const SAMPLEMIN = isAudio && index === 0 ? SAMPLEMIN_AUDIO_NOISE : SAMPLEMIN_DEFAULT;

    useEffect(() => {
        if (!active) setAudioBlob(null);
    }, [active]);

    const doShowTip = useCallback(() => data.samples.length === 0 && setShowTip(true), [data, setShowTip]);

    const onFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setLoading(true);

            if (isAudio) {
                const files = e.target.files;
                if (files && files.length > 0) {
                    const file = files[0];
                    validateAudioBlob(file)
                        .then((isValid) => {
                            if (isValid) {
                                setActive(true, index);
                                setAudioBlob(file);
                            }
                            setLoading(false);
                        })
                        .catch(() => {
                            setLoading(false);
                        });
                } else {
                    setLoading(false);
                }
            } else {
                canvasesFromFiles(Array.from(e.target.files || [])).then((canvases) => {
                    if (canvases.length > 0) {
                        canvases.forEach((v) => {
                            v.style.width = '58px';
                            v.style.height = '58px';
                        });
                        setData(
                            (data) => ({
                                label: data.label,
                                samples: [...canvases.map((c) => ({ data: c, id: '' })), ...data.samples],
                            }),
                            index
                        );
                    }
                    setLoading(false);
                });
            }
            e.target.value = '';
        },
        [setLoading, setData, index, isAudio, setActive]
    );

    const [dropProps, drop] = useDrop(
        {
            accept: [NativeTypes.URL, NativeTypes.HTML, NativeTypes.FILE],
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            async drop(items: any) {
                setLoading(true);
                try {
                    if (isAudio) {
                        // Create audio blob from dropped files or URLs
                        let audioBlob: Blob | null = null;

                        if (items.files && items.files.length > 0) {
                            audioBlob = items.files[0];
                        } else if (items.urls && items.urls.length > 0) {
                            const response = await fetch(items.urls[0]);
                            const arrayBuffer = await response.arrayBuffer();
                            audioBlob = new Blob([arrayBuffer], { type: 'audio/*' });
                        }

                        if (audioBlob) {
                            validateAudioBlob(audioBlob)
                                .then((isValid) => {
                                    if (isValid) {
                                        setActive(true, index);
                                        setAudioBlob(audioBlob);
                                    } else {
                                        setShowDropError(true);
                                    }
                                    setLoading(false);
                                })
                                .catch(() => {
                                    setShowDropError(true);
                                    setLoading(false);
                                });
                        } else {
                            setShowDropError(true);
                            setLoading(false);
                        }
                    } else {
                        const canvases = await canvasFromDataTransfer(items);

                        if (canvases.length > 0) {
                            canvases.forEach((v) => {
                                v.style.width = '58px';
                                v.style.height = '58px';
                            });
                            setData(
                                (data) => ({
                                    label: data.label,
                                    samples: [...canvases.map((c) => ({ data: c, id: '' })), ...data.samples],
                                }),
                                index
                            );
                        } else {
                            setShowDropError(true);
                        }

                        setLoading(false);
                    }
                } catch (e) {
                    setShowDropError(true);
                    console.error('Error processing drop:', e);
                    setLoading(false);
                }
            },
            collect(monitor) {
                const can = monitor.canDrop();
                return {
                    highlighted: can,
                    hovered: monitor.isOver(),
                };
            },
        },
        [setData, index, setShowDropError, setLoading, isAudio, setActive]
    );

    const setTitle = useCallback(
        (title: string) => {
            setData(
                (data) => ({
                    label: title,
                    samples: data.samples,
                }),
                index
            );
        },
        [setData, index]
    );

    const removeSamples = useCallback(() => {
        setData((data) => ({ label: data.label, samples: [] }), index);
    }, [index, setData]);

    const onCapture = useCallback(
        (image: HTMLCanvasElement) => {
            image.style.width = '58px';
            image.style.height = '58px';

            setData(
                (data) => ({
                    label: name,
                    samples: [{ data: image, id: '' }, ...data.samples],
                }),
                index
            );
        },
        [setData, index, name]
    );

    const onAudioExample = useCallback(
        (example: AudioExample) => {
            const image = example.spectrogramCanvas;
            if (image) {
                image.style.width = '58px';
                image.style.height = '58px';
            }
            setData(
                (data) => ({
                    label: name,
                    samples: [{ data: example, id: '' }, ...data.samples],
                }),
                index
            );
        },
        [setData, index, name]
    );

    const doDelete = useCallback(
        (ix: number) => {
            setData(
                (data) => ({
                    label: name,
                    samples: data.samples.filter((_, ixx) => data.samples.length - ixx !== ix),
                }),
                index
            );
        },
        [setData, name, index]
    );

    const doDeleteClass = useCallback(() => onDelete(index), [index, onDelete]);

    const doCloseWebcam = useCallback(() => {
        setActive(false, index);
        setAudioBlob(null);
    }, [setActive, index]);

    const doActivate = useCallback(() => {
        onActivate(-1);
        setTimeout(() => onActivate(index), 20);
    }, [onActivate, index]);

    const doUploadClick = useCallback(() => fileRef.current?.click(), []);

    const doDatasetClick = useCallback(() => setShowDatasetPicker(true), [setShowDatasetPicker]);

    const doDatasetPickerClose = useCallback(() => setShowDatasetPicker(false), [setShowDatasetPicker]);

    const handleSampleClick = useCallback(
        (ix: number) => {
            if (onSampleClick) {
                onSampleClick(index, data.samples.length - ix);
            }
        },
        [onSampleClick, index, data.samples.length]
    );

    const doDatasetSelected = useCallback(
        (canvases: HTMLCanvasElement[]) => {
            if (canvases.length > 0) {
                setData(
                    (data) => ({
                        label: data.label,
                        samples: [...canvases.map((c) => ({ data: c, id: '' })), ...data.samples],
                    }),
                    index
                );
            }
        },
        [setData, index]
    );

    const doDropErrorClose = useCallback(() => setShowDropError(false), [setShowDropError]);

    const doToggleDisable = useCallback(() => {
        setData(
            (data) => ({
                label: data.label,
                samples: data.samples,
                disabled: !data.disabled,
            }),
            index
        );
    }, [setData, index]);

    const doAnimation = index === 0 && showTip && showDragTip;

    return (
        <Widget
            noPadding
            active={dropProps.hovered}
            title={name}
            aria-label={t('trainingdata.aria.classCard', { name })}
            dataWidget="class"
            id={`class-${index}`}
            activated={!data.disabled && data.samples.length >= SAMPLEMIN}
            setTitle={disableClassNameEdit || (isAudio && index === 0) ? undefined : setTitle}
            menu={
                <ClassMenu
                    index={index}
                    hasSamples={data.samples.length > 0}
                    isDisabled={data.disabled}
                    onDeleteClass={isAudio && index === 0 ? undefined : doDeleteClass}
                    onRemoveSamples={removeSamples}
                    onToggleDisable={isAudio && index === 0 ? undefined : doToggleDisable}
                    onDatasets={!isAudio ? doDatasetClick : undefined}
                    disableCollaboration={isAudio}
                />
            }
        >
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                {data.disabled && (
                    <div className={style.disabledBadge}>
                        <WarningIcon />
                        {t('trainingdata.labels.disabled')}
                    </div>
                )}
                <div
                    className={`${active ? style.containerLarge : style.containerSmall} ${
                        data.disabled ? style.disabledClass : ''
                    }`}
                    onMouseEnter={doShowTip}
                >
                    {active ? (
                        isAudio ? (
                            <AudioExampleRecorder
                                className={data.label}
                                onExample={onAudioExample}
                                onClose={doCloseWebcam}
                                blob={audioBlob ?? undefined}
                            />
                        ) : (
                            <WebcamCapture
                                visible={true}
                                onCapture={onCapture}
                                onClose={doCloseWebcam}
                            />
                        )
                    ) : null}
                    <div
                        className={style.listContainer}
                        ref={drop as unknown as RefObject<HTMLDivElement>}
                    >
                        <input
                            data-testid={`file-${data.label}`}
                            hidden
                            type="file"
                            ref={fileRef}
                            accept={isAudio ? 'audio/*' : 'image/*'}
                            onChange={onFileChange}
                            multiple
                        />
                        <AlertPara
                            severity={data.samples.length === 1 ? 'info' : 'none'}
                            hideIcon={active}
                            isolated={active}
                        >
                            {data.samples.length === 0 &&
                                t(isAudio ? 'trainingdata.labels.addAudioSamples' : 'trainingdata.labels.addSamples')}
                            {data.samples.length >= SAMPLEMIN &&
                                t(isAudio ? 'trainingdata.labels.audioSamples' : 'trainingdata.labels.imageSamples', {
                                    count: data.samples.length,
                                })}
                            {data.samples.length > 0 &&
                                data.samples.length < SAMPLEMIN &&
                                t('trainingdata.labels.needsMore')}
                        </AlertPara>

                        <ol
                            ref={scrollRef}
                            className={active ? style.samplelistLarge : style.samplelistSmall}
                        >
                            <li
                                className={style.sample}
                                style={{ display: !active ? undefined : 'none' }}
                            >
                                <VerticalButton
                                    data-testid="webcambutton"
                                    variant="outlined"
                                    startIcon={isAudio ? <MicIcon /> : <VideocamIcon />}
                                    onClick={doActivate}
                                    disabled={fatal}
                                >
                                    {t(isAudio ? 'trainingdata.actions.audio' : 'trainingdata.actions.webcam')}
                                </VerticalButton>
                            </li>

                            {sampleUploadFile && (
                                <li
                                    className={style.sample}
                                    style={{ display: !active ? undefined : 'none' }}
                                >
                                    <VerticalButton
                                        data-testid="uploadbutton"
                                        variant="outlined"
                                        startIcon={<UploadFileIcon />}
                                        onClick={doUploadClick}
                                    >
                                        {t('trainingdata.actions.upload')}
                                    </VerticalButton>
                                </li>
                            )}
                            {data.samples.length === 0 && !active && !dropProps.hovered && !loading && (
                                <li>
                                    <div className={doAnimation ? style.dropSuggestAnimated : style.dropSuggest}>
                                        {t(
                                            isAudio
                                                ? 'trainingdata.labels.dropAudioFiles'
                                                : 'trainingdata.labels.dropFiles'
                                        )}
                                    </div>
                                </li>
                            )}
                            {dropProps.highlighted && dropProps.hovered && (
                                <li className={style.dropSample}>
                                    <UploadIcon />
                                </li>
                            )}
                            {data.samples.map((s, ix) => (
                                <Sample
                                    key={data.samples.length - ix}
                                    index={data.samples.length - ix}
                                    image={s.data instanceof HTMLCanvasElement ? s.data : s.data.spectrogramCanvas}
                                    onDelete={doDelete}
                                    onClick={handleSampleClick}
                                />
                            ))}
                        </ol>
                    </div>
                </div>
            </div>
            <AlertModal
                open={showDropError}
                onClose={doDropErrorClose}
                severity="error"
            >
                {t(isAudio ? 'trainingdata.labels.dropAudioError' : 'trainingdata.labels.dropError')}
            </AlertModal>
            <DatasetPicker
                open={showDatasetPicker}
                onClose={doDatasetPickerClose}
                onDatasetSelected={doDatasetSelected}
            />
        </Widget>
    );
}
