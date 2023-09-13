import React, { useCallback, useRef, useState } from 'react';
import style from './classification.module.css';
import { IClassification } from '../../state';
import { VerticalButton } from '../button/Button';
import { Widget } from '../widget/Widget';
import Sample from './Sample';
import WebcamCapture from './WebcamCapture';
import VideocamIcon from '@mui/icons-material/Videocam';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ClassMenu from './ClassMenu';
import { useTranslation } from 'react-i18next';
import { useDrop } from 'react-dnd';
import { useVariant } from '../../util/variant';
import { NativeTypes } from 'react-dnd-html5-backend';
import UploadIcon from '@mui/icons-material/Upload';
import {
    canvasFromURL,
    canvasFromFile,
    canvasFromImage,
    canvasFromDataTransfer,
    canvasesFromFiles,
} from '../../util/canvas';
import DnDAnimation from '../DnDAnimation/DnDAnimation';
import AlertPara from '../AlertPara/AlertPara';
import AlertModal from '../AlertModal/AlertModal';

const SAMPLEMIN = 2;

interface Props {
    name: string;
    active: boolean;
    onActivate: (ix: number) => void;
    onDelete: (ix: number) => void;
    data: IClassification;
    setData: (data: (old: IClassification) => IClassification, ix: number) => void;
    setActive: (active: boolean, ix: number) => void;
    index: number;
}

export function Classification({ name, active, data, index, setData, onActivate, setActive, onDelete }: Props) {
    const { namespace, sampleUploadFile, disableClassNameEdit, showDragTip } = useVariant();
    const { t } = useTranslation(namespace);
    const fileRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLOListElement>(null);
    const [loading, setLoading] = useState(false);
    const [showTip, setShowTip] = useState(false);
    const [showDropError, setShowDropError] = useState(false);

    const doShowTip = useCallback(() => data.samples.length === 0 && setShowTip(true), [data, setShowTip]);

    const onFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setLoading(true);
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
            e.target.value = '';
        },
        [setLoading, setData, index]
    );

    const [dropProps, drop] = useDrop(
        {
            accept: [NativeTypes.URL, NativeTypes.HTML, NativeTypes.FILE],
            async drop(items: any) {
                setLoading(true);
                try {
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
                } catch (e) {
                    setShowDropError(true);
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
        [setData, index, setShowDropError]
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

    const doDelete = useCallback(
        (ix: number) => {
            setData(
                (data) => ({
                    label: name,
                    samples: data.samples.filter((ss, ixx) => data.samples.length - ixx !== ix),
                }),
                index
            );
        },
        [setData, name, index]
    );

    const doDeleteClass = useCallback(() => onDelete(index), [index, onDelete]);

    const doCloseWebcam = useCallback(() => setActive(false, index), [setActive, index]);

    const doActivate = useCallback(() => onActivate(index), [onActivate, index]);

    const doUploadClick = useCallback(() => fileRef.current?.click(), []);

    const doDropErrorClose = useCallback(() => setShowDropError(false), [setShowDropError]);

    const doAnimation = index === 0 && showTip && showDragTip;

    return (
        <Widget
            active={dropProps.hovered}
            title={name}
            aria-label={t<string>('trainingdata.aria.classCard', { name })}
            dataWidget="class"
            setTitle={disableClassNameEdit ? undefined : setTitle}
            menu={
                <ClassMenu
                    index={index}
                    hasSamples={data.samples.length > 0}
                    onDeleteClass={doDeleteClass}
                    onRemoveSamples={removeSamples}
                />
            }
        >
            <div
                className={active ? style.containerLarge : style.containerSmall}
                onMouseEnter={doShowTip}
            >
                {active ? (
                    <WebcamCapture
                        visible={true}
                        onCapture={onCapture}
                        onClose={doCloseWebcam}
                    />
                ) : null}
                <div
                    className={style.listContainer}
                    ref={drop}
                >
                    <input
                        data-testid={`file-${data.label}`}
                        hidden
                        type="file"
                        ref={fileRef}
                        accept="image/*"
                        onChange={onFileChange}
                        multiple
                    />
                    <AlertPara
                        severity={data.samples.length === 1 ? 'info' : 'none'}
                        hideIcon={active}
                        isolated={active}
                    >
                        {data.samples.length === 0 && t('trainingdata.labels.addSamples')}
                        {data.samples.length >= SAMPLEMIN &&
                            t('trainingdata.labels.imageSamples', { count: data.samples.length })}
                        {data.samples.length > 0 &&
                            data.samples.length < SAMPLEMIN &&
                            t('trainingdata.labels.needsMore')}
                    </AlertPara>

                    {doAnimation && <DnDAnimation />}
                    <ol
                        ref={scrollRef}
                        className={active ? style.samplelistLarge : style.samplelistSmall}
                    >
                        {!active && (
                            <li className={style.sample}>
                                <VerticalButton
                                    data-testid="webcambutton"
                                    variant="outlined"
                                    startIcon={<VideocamIcon />}
                                    onClick={doActivate}
                                >
                                    {t('trainingdata.actions.webcam')}
                                </VerticalButton>
                            </li>
                        )}
                        {!active && sampleUploadFile && (
                            <li className={style.sample}>
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
                                    {t('trainingdata.labels.dropFiles')}
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
                                image={s.data}
                                onDelete={doDelete}
                            />
                        ))}
                    </ol>
                </div>
            </div>
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

// {isDragActive && <div className={style.dropOverlay}>{t('trainingdata.labels.dropFiles')}</div>}
