import { Button, canvasesFromFiles, canvasFromDataTransfer } from '@genai-fi/base';
import { AudioExample } from '@genai-fi/classifier';
import { Skeleton } from '@mui/material';
import { useDrop } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useTeachableModel } from '@genaitm/util/TeachableModel';
import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import style from './Input.module.css';
import { useTranslation } from 'react-i18next';
import AlertModal from '@genaitm/components/AlertModal';
import { useVariant } from '@genaitm/util/variant';
import { validateAudioBlob } from '@genaitm/util/audio';
import AudioInput from '@genaitm/components/AudioExampleRecorder/AudioInput';

interface Props {
    isAudio: boolean;
    example?: HTMLCanvasElement | AudioExample;
    enableInput: boolean;
    onExample: (example: HTMLCanvasElement | AudioExample) => void;
}

export default function FileInput({ isAudio, example, onExample, enableInput }: Props) {
    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);
    const { imageSize, canPredict } = useTeachableModel();
    const fileRef = useRef<HTMLInputElement>(null);
    const [showDropError, setShowDropError] = useState(false);
    const fileImageRef = useRef<HTMLDivElement>(null);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);

    const doDropErrorClose = useCallback(() => setShowDropError(false), [setShowDropError]);

    const [dropProps, drop] = useDrop(
        {
            accept: [NativeTypes.FILE, NativeTypes.URL, NativeTypes.HTML],
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            async drop(items: any) {
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
                                    setAudioBlob(audioBlob);
                                } else {
                                    setShowDropError(true);
                                }
                            })
                            .catch(() => {
                                setShowDropError(true);
                            });
                    } else {
                        setShowDropError(true);
                    }
                } else {
                    const canvases = await canvasFromDataTransfer(items, imageSize);

                    if (canvases.length === 0) {
                        setShowDropError(true);
                    } else {
                        onExample(canvases[0]);
                    }
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
        [setShowDropError, onExample, imageSize]
    );

    const doUploadClick = useCallback(() => fileRef.current?.click(), []);

    const onFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (isAudio) {
                const files = e.target.files;
                if (files && files.length > 0) {
                    const file = files[0];
                    validateAudioBlob(file)
                        .then((isValid) => {
                            if (isValid) {
                                setAudioBlob(file);
                            }
                        })
                        .catch(() => {});
                }
            } else {
                canvasesFromFiles(Array.from(e.target.files || []), imageSize).then((canvases) => {
                    if (canvases.length === 0) {
                        setShowDropError(true);
                    } else {
                        onExample(canvases[0]);
                    }
                });
            }
            e.target.value = '';
        },
        [setShowDropError, onExample, imageSize, isAudio]
    );

    useEffect(() => {
        if (fileImageRef.current && example && example instanceof HTMLCanvasElement) {
            example.style.width = '224px';
            example.style.height = '224px';
            while (fileImageRef.current.firstChild) {
                fileImageRef.current.removeChild(fileImageRef.current.firstChild);
            }
            fileImageRef.current.appendChild(example);
        }
    }, [example]);

    return (
        <div
            ref={drop as unknown as RefObject<HTMLDivElement>}
            className={style.fileInputContainer}
        >
            <input
                type="file"
                hidden
                onChange={onFileChange}
                accept={isAudio ? 'audio/*' : 'image/*'}
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
            {isAudio && (
                <AudioInput
                    blob={audioBlob ?? undefined}
                    recording={enableInput && !!audioBlob}
                    onExample={onExample}
                    includeCanvas={false}
                    includeRawAudio={false}
                    showDuration
                    allowReplay
                    showMicSelect={false}
                />
            )}
            {!isAudio && !!example && (
                <div
                    role="img"
                    aria-label={t('input.aria.imageFile')}
                    ref={fileImageRef}
                    className={style.fileImage}
                />
            )}
            {!isAudio && !example && (
                <Skeleton
                    sx={{ marginTop: '1rem' }}
                    variant="rounded"
                    width={isAudio ? 200 : 224}
                    height={isAudio ? 58 : 224}
                />
            )}
            <AlertModal
                open={showDropError}
                onClose={doDropErrorClose}
                severity="error"
            >
                {t('trainingdata.labels.dropError')}
            </AlertModal>
        </div>
    );
}
