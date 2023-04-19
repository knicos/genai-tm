import React, { useCallback, useState, useEffect, useRef } from 'react';
import style from './Behaviour.module.css';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import IconButton from '@mui/material/IconButton';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { VerticalButton } from '../button/Button';
import { useDrop } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';
import UploadIcon from '@mui/icons-material/Upload';
import { useTranslation } from 'react-i18next';
import { useVariant } from '../../util/variant';
import AudioRecorder from '../AudioRecorder/AudioRecorder';

export interface AudioBehaviour {
    uri: string;
    name: string;
}

interface Props {
    behaviour?: AudioBehaviour;
    setBehaviour: (behaviour: AudioBehaviour | undefined) => void;
}

export default function Sound({ behaviour, setBehaviour }: Props) {
    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            if (acceptedFiles.length === 1) {
                const reader = new FileReader();
                reader.onabort = () => console.warn('file reading aborted');
                reader.onerror = () => console.error('file reading error');
                reader.onload = () => {
                    setBehaviour({
                        uri: reader.result as string,
                        name: acceptedFiles[0].name,
                    });
                };
                reader.readAsDataURL(acceptedFiles[0]);
            }
        },
        [setBehaviour]
    );

    const [dropProps, drop] = useDrop({
        accept: [NativeTypes.FILE, NativeTypes.URL],
        drop(items: any) {
            onDrop(items.files);
        },
        canDrop(item: any) {
            if (item?.files) {
                for (const i of item?.files) {
                    if (!i.type.startsWith('audio/')) return false;
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
                hovered: monitor.isOver() && can,
            };
        },
    });

    const doPlay = useCallback(
        () =>
            setAudio((old: HTMLAudioElement | null) => {
                if (old) return old;
                if (!behaviour?.uri) return null;

                const a = new Audio(behaviour.uri);
                setAudio(a);
                a.loop = true;
                a.play();
                return a;
            }),
        [setAudio, behaviour]
    );

    const doStop = useCallback(
        () =>
            setAudio((old: HTMLAudioElement | null) => {
                if (!old) return null;
                old.pause();
                return null;
            }),
        [setAudio]
    );

    useEffect(doStop, [doStop, behaviour]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => () => doStop(), []);

    const doDelete = useCallback(() => {
        setBehaviour(undefined);
    }, [setBehaviour]);

    const doUploadClick = useCallback(() => fileRef.current?.click(), []);

    const onFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            onDrop(Array.from(e.target.files || []));
        },
        [onDrop]
    );

    const onAudioData = useCallback(
        (data: string) => {
            setBehaviour({
                uri: data,
                name: t<string>('behaviours.labels.voiceRecording'),
            });
        },
        [setBehaviour, t]
    );

    return (
        <>
            <p className={style.audioTitle}>{behaviour?.name}</p>
            <div
                className={style.imageContainer}
                ref={drop}
            >
                <input
                    data-testid={`audio-file-upload}`}
                    hidden
                    type="file"
                    ref={fileRef}
                    accept="audio/*"
                    onChange={onFileChange}
                />
                <AudioRecorder onData={onAudioData} />
                <VerticalButton
                    data-testid="audio-upload"
                    variant="outlined"
                    startIcon={<UploadFileIcon />}
                    onClick={doUploadClick}
                >
                    {t('behaviours.actions.upload')}
                </VerticalButton>
                <VerticalButton
                    data-testid="audio-delete"
                    variant="outlined"
                    disabled={!behaviour}
                    onClick={doDelete}
                    startIcon={<DeleteForeverIcon />}
                >
                    {t('behaviours.actions.delete')}
                </VerticalButton>
                <div className={style.image}>
                    {!audio && (
                        <IconButton
                            aria-label={t<string>('behaviours.aria.stop')}
                            data-testid="audio-play"
                            disabled={!behaviour}
                            color="primary"
                            onClick={doPlay}
                            size="large"
                        >
                            <PlayArrowIcon fontSize="large" />
                        </IconButton>
                    )}
                    {audio && (
                        <IconButton
                            aria-label={t<string>('behaviours.aria.stop')}
                            data-testid="audio-stop"
                            color="primary"
                            onClick={doStop}
                            size="large"
                        >
                            <StopIcon fontSize="large" />
                        </IconButton>
                    )}
                    {dropProps.hovered && (
                        <div className={style.dropImage}>
                            <UploadIcon />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
