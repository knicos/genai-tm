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

interface Props {
    name: string;
    active: boolean;
    onActivate: (ix: number) => void;
    onDelete: (ix: number) => void;
    data: IClassification;
    setData: (data: IClassification, ix: number) => void;
    setActive: (active: boolean, ix: number) => void;
    index: number;
}

function cropTo(image: HTMLImageElement, size: number, flipped: boolean, canvas: HTMLCanvasElement) {
    const width = image.width;
    const height = image.height;

    const min = Math.min(width, height);
    const scale = size / min;
    const scaledW = Math.ceil(width * scale);
    const scaledH = Math.ceil(height * scale);
    const dx = scaledW - size;
    const dy = scaledH - size;
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.drawImage(image, ~~(dx / 2) * -1, ~~(dy / 2) * -1, scaledW, scaledH);

        // canvas is already sized and cropped to center correctly
        if (flipped) {
            ctx.scale(-1, 1);
            ctx.drawImage(canvas, size * -1, 0);
        }
    }

    return canvas;
}

export function Classification({ name, active, data, index, setData, onActivate, setActive, onDelete }: Props) {
    const { namespace, sampleUploadFile, disableClassNameEdit } = useVariant();
    const { t } = useTranslation(namespace);
    const fileRef = useRef<HTMLInputElement>(null);
    const scrollRef = useRef<HTMLOListElement>(null);
    const [loading, setLoading] = useState(false);

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            setLoading(true);
            const promises = acceptedFiles.map(
                (file) =>
                    new Promise<HTMLCanvasElement>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onabort = () => reject();
                        reader.onerror = () => reject();
                        reader.onload = () => {
                            const newCanvas = document.createElement('canvas');
                            newCanvas.width = 224;
                            newCanvas.height = 224;
                            newCanvas.style.width = '58px';
                            const img = new Image();
                            img.onload = () => {
                                cropTo(img, 224, false, newCanvas);
                                resolve(newCanvas);
                            };
                            img.onerror = () => {
                                resolve(newCanvas);
                            };
                            img.src = reader.result as string;

                            // Note: Here to integration tests. "onload" is not called in jest.
                            if (global?.process?.env?.NODE_ENV === 'test') img.onload(new Event('onload'));
                        };
                        reader.readAsDataURL(file);
                    })
            );

            Promise.all(promises)
                .then((results: HTMLCanvasElement[]) => {
                    setData(
                        {
                            label: data.label,
                            samples: [...results, ...data.samples],
                        },
                        index
                    );
                    setLoading(false);
                })
                .catch((e) => console.error(e));
        },
        [setData, data, index]
    );

    const onFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            onDrop(Array.from(e.target.files || []));
        },
        [onDrop]
    );

    const [dropProps, drop] = useDrop({
        accept: [NativeTypes.FILE, NativeTypes.URL],
        drop(items: any) {
            onDrop(items.files);
        },
        canDrop(item: any) {
            for (const i of item?.files) {
                if (!i.type.startsWith('image/')) {
                    return false;
                }
            }
            return true;
        },
        collect(monitor) {
            const can = monitor.canDrop();
            return {
                highlighted: can,
                hovered: monitor.isOver(),
            };
        },
    });

    /*useEffect(() => {
        if (scrollRef.current && dropProps.hovered) {
            scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
        }
    }, [dropProps.hovered]);*/

    const setTitle = useCallback(
        (title: string) => {
            setData(
                {
                    label: title,
                    samples: data.samples,
                },
                index
            );
        },
        [setData, index, data]
    );

    const removeSamples = useCallback(() => {
        setData({ label: data.label, samples: [] }, index);
    }, [data, index, setData]);

    const onCapture = useCallback(
        (image: HTMLCanvasElement) => {
            image.style.width = '58px';

            setData(
                {
                    label: name,
                    samples: [...data.samples, image],
                },
                index
            );
        },
        [setData, data, index, name]
    );

    const doDelete = useCallback(
        (ix: number) => {
            setData(
                {
                    label: name,
                    samples: data.samples.filter((ss, ixx) => ixx !== ix),
                },
                index
            );
        },
        [setData, name, data, index]
    );

    const doDeleteClass = useCallback(() => onDelete(index), [index, onDelete]);

    const doCloseWebcam = useCallback(() => setActive(false, index), [setActive, index]);

    const doActivate = useCallback(() => onActivate(index), [onActivate, index]);

    const doUploadClick = useCallback(() => fileRef.current?.click(), []);

    return (
        <Widget
            title={name}
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
            <div className={active ? style.containerLarge : style.containerSmall}>
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
                    {data.samples.length === 0 && (
                        <p className={style.samplesLabel}>{t('trainingdata.labels.addSamples')}:</p>
                    )}
                    {data.samples.length > 0 && (
                        <p className={style.samplesLabel}>
                            {t('trainingdata.labels.imageSamples', { count: data.samples.length })}
                        </p>
                    )}
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
                                <div className={style.dropSuggest}>{t('trainingdata.labels.dropFiles')}</div>
                            </li>
                        )}
                        {dropProps.highlighted && dropProps.hovered && (
                            <li className={style.dropSample}>
                                <UploadIcon />
                            </li>
                        )}
                        {data.samples.map((s, ix) => (
                            <Sample
                                key={ix}
                                index={ix}
                                image={s}
                                onDelete={doDelete}
                            />
                        ))}
                    </ol>
                </div>
            </div>
        </Widget>
    );
}

// {isDragActive && <div className={style.dropOverlay}>{t('trainingdata.labels.dropFiles')}</div>}
