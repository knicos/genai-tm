import React, { useCallback, useState, useEffect, useRef } from 'react';
import style from './Behaviour.module.css';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import IconButton from '@mui/material/IconButton';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { VerticalButton } from '@genaitm/components/button/Button';
import UploadIcon from '@mui/icons-material/Upload';
import { useTranslation } from 'react-i18next';
import { useVariant } from '@genaitm/util/variant';
import AudioRecorder from '@genaitm/components/AudioRecorder/AudioRecorder';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

export interface AudioBehaviour {
    uri: string;
    name: string;
    loop?: boolean;
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
                a.onended = () => {
                    setAudio(null);
                };
                a.loop = behaviour.loop || false;
                a.play()?.catch((e) => console.error(e));
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
        (data: Blob) => {
            const fr = new FileReader();
            fr.onload = (e) => {
                if (e.target?.result) {
                    setBehaviour({
                        uri: e.target.result as string,
                        name: t('behaviours.labels.voiceRecording'),
                    });
                }
            };
            fr.readAsDataURL(data);
        },
        [setBehaviour, t]
    );

    const doPlayStop = useCallback(() => (audio ? doStop() : doPlay()), [audio, doStop, doPlay]);

    const changeLoop = useCallback(
        (_: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
            if (behaviour) {
                setBehaviour({ ...behaviour, loop: checked });
            }
        },
        [setBehaviour, behaviour]
    );

    return (
        <>
            <div className={style.baseContainer}>
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
                            aria-label={t(!audio ? 'behaviours.aria.play' : 'behaviours.aria.stop')}
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
            <div className={style.audioOptions}>
                <FormControlLabel
                    labelPlacement="start"
                    control={
                        <Switch
                            disabled={!behaviour?.uri}
                            checked={behaviour?.loop}
                            onChange={changeLoop}
                            data-testid="loop-switch"
                            aria-label={t('behaviours.aria.loop')}
                        />
                    }
                    hidden
                    label={t('behaviours.labels.loop')}
                />
            </div>
        </>
    );
}
