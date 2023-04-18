import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { DeployEventData } from '../../components/Deployer/Deployer';
import { loadProject } from '../../components/ImageWorkspace/loader';
import { TeachableMobileNet } from '@teachablemachine/image';
import { BehaviourType } from '../../components/Behaviour/Behaviour';
import RawOutput from '../../components/Output/RawOutput';
import { useRecoilState } from 'recoil';
import { predictedIndex } from '../../state';
import style from './style.module.css';
import randomId from '../../util/randomId';
import { sendData } from '../../util/comms';
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

const WIDTH = 400;
const HEIGHT = 350;

interface Predictions {
    className: string;
    probability: number;
}

export default function Deployment() {
    const channel = useRef<BroadcastChannel>();
    const { code } = useParams();
    const [model, setModel] = useState<TeachableMobileNet | null>(null);
    const [behaviours, setBehaviours] = useState<BehaviourType[]>([]);
    const [predicted, setPredictionIndex] = useRecoilState(predictedIndex);
    const [myCode] = useState(() => randomId(8));
    const [volume, setVolume] = useState(100);
    const changeVolume = useCallback((event: Event, newValue: number | number[]) => {
        setVolume(newValue as number);
    }, []);
    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);
    const [paused, setPaused] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);
    const inputRef = useRef<HTMLDivElement>(null);
    const [input, setInput] = useState<HTMLCanvasElement | null>(null);

    useEffect(() => {
        async function update() {
            let predictions: Predictions[] = [];

            if (model && input) {
                predictions = await model.predict(input);
            }

            if (predictions.length > 0) {
                const nameOfMax = predictions.reduce((prev, val) => (val.probability > prev.probability ? val : prev));
                setPredictionIndex(predictions.indexOf(nameOfMax));
            } else {
                setPredictionIndex(-1);
            }
        }
        update();

        if (input && inputRef.current) {
            while (inputRef.current.lastChild) {
                inputRef.current.removeChild(inputRef.current.lastChild);
            }
            inputRef.current.appendChild(input);
        }
    }, [input, model, setPredictionIndex]);

    const scaleFactor = Math.min((window.innerHeight - 200) / HEIGHT, window.innerWidth / WIDTH);

    useEffect(() => {
        channel.current = new BroadcastChannel(`deployment:${myCode}`);
        channel.current.onmessage = async (ev: MessageEvent<DeployEventData>) => {
            if (ev.data.event === 'data') {
                const project = await loadProject(ev.data.project);
                if (project.model) setModel(project.model);
                if (project.behaviours) setBehaviours(project.behaviours);
            }
        };
        sendData(`model:${code}`, { event: 'request', channel: `deployment:${myCode}` });
    }, []);

    const onDrop = useCallback(
        async (acceptedFiles: File[]) => {
            if (acceptedFiles.length === 1) {
                const newCanvas = await canvasFromFile(acceptedFiles[0]);
                setPaused(true);
                setTimeout(() => setInput(newCanvas), 200);
            }
        },
        [setPaused, setInput]
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

    const onFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            onDrop(Array.from(e.target.files || []));
        },
        [onDrop]
    );

    const doCapture = useCallback(
        (image: HTMLCanvasElement) => {
            setInput(image);
        },
        [setInput]
    );

    const doPause = useCallback(() => {
        setPaused(!paused);
    }, [setPaused, paused]);
    const doUpload = useCallback(() => fileRef.current?.click(), [fileRef]);

    return (
        <div
            className={style.container}
            ref={drop}
        >
            <Webcam
                hidden
                onCapture={doCapture}
                capture
                interval={100}
                disable={paused}
            />
            <RawOutput
                behaviours={behaviours}
                predicted={predicted}
                scaleFactor={scaleFactor}
                volume={volume}
            />
            <input
                type="file"
                accept="image/*"
                hidden
                ref={fileRef}
                onChange={onFileChange}
            />
            <div
                className={style.controls}
                style={{ width: `${Math.floor(scaleFactor * WIDTH)}px` }}
            >
                <div
                    ref={inputRef}
                    className={style.inputContainer}
                />
                <IconButton
                    color="inherit"
                    onClick={doPause}
                >
                    {!paused && <VideocamIcon fontSize="large" />}
                    {paused && <VideocamOffIcon fontSize="large" />}
                </IconButton>
                <IconButton
                    color="inherit"
                    onClick={doUpload}
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
                />
                <VolumeUp />
            </div>
        </div>
    );
}
