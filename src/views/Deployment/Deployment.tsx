import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { DeployEventData } from '../../components/Deployer/Deployer';
import { loadProject } from '../../components/ImageWorkspace/loader';
import { TeachableMobileNet } from '@teachablemachine/image';
import { BehaviourType } from '../../components/Behaviour/Behaviour';
import RawOutput from '../../components/Output/RawOutput';
import { Webcam as TMWebcam } from '@teachablemachine/image';
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
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';

const WIDTH = 400;
const HEIGHT = 350;

export default function Deployment() {
    const channel = useRef<BroadcastChannel>();
    const { code } = useParams();
    const [model, setModel] = useState<TeachableMobileNet | null>(null);
    const [behaviours, setBehaviours] = useState<BehaviourType[]>([]);
    const [webcam, setWebcam] = useState<TMWebcam | null>(null);
    const [predicted, setPredictionIndex] = useRecoilState(predictedIndex);
    const requestRef = useRef(-1);
    const previousTimeRef = useRef(0);
    const [myCode] = useState(() => randomId(8));
    const [volume, setVolume] = useState(100);
    const changeVolume = useCallback((event: Event, newValue: number | number[]) => {
        setVolume(newValue as number);
    }, []);
    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);
    const [paused, setPaused] = useState(false);

    const loop = useCallback(
        async (timestamp: number) => {
            if (webcam && !paused) {
                webcam.update();
                const actualInterval = 200.0;
                if (model && timestamp - previousTimeRef.current >= actualInterval) {
                    const predictions = await model.predict(webcam.canvas);
                    const nameOfMax = predictions.reduce((prev, val) =>
                        val.probability > prev.probability ? val : prev
                    );
                    setPredictionIndex(predictions.indexOf(nameOfMax));
                    previousTimeRef.current = timestamp;
                }
            }
            requestRef.current = window.requestAnimationFrame(loop);
        },
        [webcam, model, setPredictionIndex, paused]
    );

    async function initWebcam() {
        const newWebcam = new TMWebcam(224, 224, true);
        await newWebcam.setup();
        setWebcam(newWebcam);
        await newWebcam.play();
    }

    const scaleFactor = Math.min((window.innerHeight - 200) / HEIGHT, window.innerWidth / WIDTH);

    useEffect(() => {
        initWebcam().catch((e) => console.error('No webcam', e));
        channel.current = new BroadcastChannel(`deployment:${myCode}`);
        channel.current.onmessage = async (ev: MessageEvent<DeployEventData>) => {
            if (ev.data.event === 'data') {
                const project = await loadProject(ev.data.project);
                if (project.model) setModel(project.model);
                if (project.behaviours) setBehaviours(project.behaviours);
            }
        };
        sendData(`model:${code}`, { event: 'request', channel: `deployment:${myCode}` });

        return () => {
            if (webcam) {
                webcam.stop();
            }
            if (requestRef.current >= 0) {
                window.cancelAnimationFrame(requestRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (webcam) {
            if (requestRef.current >= 0) {
                window.cancelAnimationFrame(requestRef.current);
            }
            requestRef.current = window.requestAnimationFrame(loop);
        }
    }, [webcam, loop]);

    const doPause = useCallback(() => setPaused(!paused), [setPaused, paused]);

    return (
        <div className={style.container}>
            <RawOutput
                behaviours={behaviours}
                predicted={predicted}
                scaleFactor={scaleFactor}
                volume={100}
            />
            <div className={style.volumeContainer}>
                <IconButton
                    onClick={doPause}
                    color="inherit"
                >
                    {paused && <PlayArrowIcon fontSize="large" />}
                    {!paused && <PauseIcon fontSize="large" />}
                </IconButton>
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
