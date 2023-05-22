import React, { useRef, useEffect, useState, useCallback } from 'react';
import style from './style.module.css';
import Slider from '@mui/material/Slider';
import VolumeDown from '@mui/icons-material/VolumeDown';
import VolumeUp from '@mui/icons-material/VolumeUp';
import { useVariant } from '../../util/variant';
import { useTranslation } from 'react-i18next';
import IconButton from '@mui/material/IconButton';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import { canvasFromFile } from '../../util/canvas';
import { useDrop } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';
import { Webcam } from '../../components/webcam/Webcam';
import Display, { WrappedInput } from './Display';
import Alert from '@mui/material/Alert';
import { BehaviourType } from '../../components/Behaviour/Behaviour';
import { TeachableModel } from '../../util/TeachableModel';

const WIDTH = 400;
const HEIGHT = 350;

interface Props extends React.PropsWithChildren {
    model: TeachableModel | null;
    behaviours: BehaviourType[];
    error: boolean;
    onCloseError: () => void;
}

export default function Deployment({ model, behaviours, error, onCloseError, children }: Props) {
    const [volume, setVolume] = useState(100);
    const changeVolume = useCallback((event: Event, newValue: number | number[]) => {
        setVolume(newValue as number);
    }, []);
    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);
    const [paused, setPaused] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);
    const inputRef = useRef<HTMLDivElement>(null);
    const [input, setInput] = useState<WrappedInput | null>(null);

    const scaleFactor = Math.min((window.innerHeight - 200 - 164) / HEIGHT, (window.innerWidth - 40) / WIDTH);

    const onDrop = useCallback(
        async (acceptedFiles: File[]) => {
            if (acceptedFiles.length === 1) {
                if (!acceptedFiles[0].type.startsWith('image/')) return;
                const newCanvas = await canvasFromFile(acceptedFiles[0]);
                setPaused(true);
                setTimeout(() => setInput({ element: newCanvas }), 200);
            }
        },
        [setPaused, setInput]
    );

    const [dropProps, drop] = useDrop({
        accept: [NativeTypes.FILE, NativeTypes.URL],
        drop(items: any) {
            onDrop(items.files);
        },
        collect(monitor) {
            const can = monitor.canDrop();
            return {
                highlighted: can,
                hovered: monitor.isOver(),
            };
        },
    });

    const onFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            onDrop(Array.from(e.target.files || []));
            e.target.value = '';
        },
        [onDrop]
    );

    const doCapture = useCallback(
        (image: HTMLCanvasElement) => {
            setInput({ element: image });
        },
        [setInput]
    );

    useEffect(() => {
        if (input?.element && inputRef.current) {
            if (inputRef.current.firstChild === input.element) return;
            while (inputRef.current.lastChild) {
                inputRef.current.removeChild(inputRef.current.lastChild);
            }
            inputRef.current.appendChild(input.element);
        }
    }, [input?.element]);

    const doPause = useCallback(() => {
        setPaused(!paused);
    }, [setPaused, paused]);
    const doUpload = useCallback(() => fileRef.current?.click(), [fileRef]);

    return (
        <div
            className={dropProps.hovered ? style.dropContainer : style.container}
            ref={drop}
        >
            <Display
                behaviours={behaviours}
                scaleFactor={scaleFactor}
                volume={volume}
                model={model}
                input={input}
                error={error ? t<string>('deploy.labels.notFound') : undefined}
            >
                {children}
                {error && (
                    <Alert
                        className={style.errorInfo}
                        severity="info"
                    >
                        {t('deploy.labels.errorInfo')}
                    </Alert>
                )}
            </Display>
            {dropProps.hovered && <div className={style.dropInfo}>{t('deploy.labels.dropHere')}</div>}
            <input
                type="file"
                accept="image/*"
                hidden
                ref={fileRef}
                onChange={onFileChange}
            />
            <div
                className={style.barContainer}
                style={{ width: `${Math.floor(scaleFactor * WIDTH)}px` }}
            >
                <div className={style.controls}>
                    <div
                        ref={inputRef}
                        className={style.inputContainer}
                    />
                    <Webcam
                        hidden
                        onCapture={doCapture}
                        capture
                        interval={100}
                        disable={paused || error}
                        direct
                        size={model?.getImageSize() || 224}
                    />
                    <IconButton
                        color="inherit"
                        onClick={doPause}
                        disabled={error}
                    >
                        {!paused && <VideocamIcon fontSize="large" />}
                        {paused && <VideocamOffIcon fontSize="large" />}
                    </IconButton>
                    <IconButton
                        color="inherit"
                        onClick={doUpload}
                        disabled={error}
                    >
                        <FileUploadIcon fontSize="large" />
                    </IconButton>
                </div>
                <div className={style.volumeContainer}>
                    <VolumeDown />
                    <Slider
                        aria-label={t<string>('output.aria.volume')}
                        value={volume}
                        onChange={changeVolume}
                        disabled={error}
                    />
                    <VolumeUp />
                </div>
            </div>
        </div>
    );
}
