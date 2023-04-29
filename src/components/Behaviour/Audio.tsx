import React, { useCallback, useState, useEffect, useRef } from 'react';
import style from './Behaviour.module.css';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import IconButton from '@mui/material/IconButton';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { VerticalButton } from '../button/Button';
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
    dropping?: boolean;
    setBehaviour: (behaviour: AudioBehaviour | undefined) => void;
}

export default function Sound({ behaviour, setBehaviour, dropping }: Props) {
    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            if (acceptedFiles.length === 1) {
                if (!acceptedFiles[0].type.startsWith('audio/')) return;
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
            e.target.value = '';
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

    const doPlayStop = useCallback(() => (audio ? doStop() : doPlay()), [audio, doStop, doPlay]);

    return (
        <>
            <div className={style.imageContainer}>
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
                <div className={style.audio}>
                    {!dropping && (
                        <IconButton
                            aria-label={t<string>(!audio ? 'behaviours.aria.play' : 'behaviours.aria.stop')}
                            data-testid="audio-play"
                            disabled={!behaviour}
                            color="primary"
                            onClick={doPlayStop}
                            size="large"
                        >
                            {!audio ? <PlayArrowIcon fontSize="large" /> : <StopIcon fontSize="large" />}
                        </IconButton>
                    )}
                    {dropping && (
                        <div className={style.dropImage}>
                            <UploadIcon />
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
