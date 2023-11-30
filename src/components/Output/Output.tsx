import { useState, useCallback } from 'react';
import { Widget } from '../widget/Widget';
import { useTranslation } from 'react-i18next';
import style from './Output.module.css';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useVariant } from '../../util/variant';
import { useRecoilState, useRecoilValue } from 'recoil';
import { predictedIndex, sessionCode, sessionPassword, behaviourState, p2pActive, fatalWebcam } from '../../state';
import RawOutput from './RawOutput';
import Slider from '@mui/material/Slider';
import VolumeDown from '@mui/icons-material/VolumeDown';
import VolumeUp from '@mui/icons-material/VolumeUp';

interface Props {
    focus?: boolean;
    disabled?: boolean;
    hidden?: boolean;
}

export default function Output(props: Props) {
    const code = useRecoilValue(sessionCode);
    const pwd = useRecoilValue(sessionPassword);
    const behaviours = useRecoilValue(behaviourState);
    const [, setP2PEnabled] = useRecoilState(p2pActive);
    const [volume, setVolume] = useState(100);
    const changeVolume = useCallback((_: Event, newValue: number | number[]) => {
        setVolume(newValue as number);
    }, []);

    const { namespace, allowDeploy, usep2p, enableCollaboration } = useVariant();
    const { t } = useTranslation(namespace);
    const predicted = useRecoilValue(predictedIndex);
    const fatal = useRecoilValue(fatalWebcam);

    const doDeployClick = useCallback(() => {
        setP2PEnabled(true);
    }, [setP2PEnabled]);

    return (
        <Widget
            dataWidget={'output'}
            title={t<string>('output.labels.title')}
            className={style.widget}
            {...props}
            menu={
                allowDeploy &&
                !fatal && (
                    <a
                        className={style.deployLink}
                        href={`/deploy/${usep2p ? 'p' : 'b'}/${code}?p=${pwd}&qr=${enableCollaboration ? '1' : '0'}`}
                        target="_blank"
                        aria-label={t<string>('output.aria.expand')}
                        rel="noreferrer"
                        onClick={doDeployClick}
                    >
                        <OpenInNewIcon />
                        {t('output.labels.deploy')}
                    </a>
                )
            }
        >
            <RawOutput
                behaviours={behaviours}
                predicted={predicted}
                scaleFactor={1.0}
                volume={volume}
            />
            <div className={style.volumeContainer}>
                <VolumeDown />
                <Slider
                    aria-label={t<string>('output.aria.volume')}
                    value={volume}
                    onChange={changeVolume}
                />
                <VolumeUp />
            </div>
        </Widget>
    );
}
