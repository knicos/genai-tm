import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import style from './Output.module.css';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useVariant } from '../../util/variant';
import { useAtom, useAtomValue } from 'jotai';
import { predictedIndex, sessionCode, sessionPassword, behaviourState, p2pActive, fatalWebcam } from '../../state';
import RawOutput from './RawOutput';
import Slider from '@mui/material/Slider';
import VolumeDown from '@mui/icons-material/VolumeDown';
import VolumeUp from '@mui/icons-material/VolumeUp';
import { useActiveNode } from '@genaitm/util/nodes';
import { Widget } from '@genai-fi/base';

interface Props {
    focus?: boolean;
    disabled?: boolean;
    hidden?: boolean;
}

export default function Output(props: Props) {
    const code = useAtomValue(sessionCode);
    const pwd = useAtomValue(sessionPassword);
    const behaviours = useAtomValue(behaviourState);
    const [, setP2PEnabled] = useAtom(p2pActive);
    const [volume, setVolume] = useState(100);
    const changeVolume = useCallback((_: Event, newValue: number | number[]) => {
        setVolume(newValue as number);
    }, []);

    const { namespace, allowDeploy, usep2p, enableCollaboration } = useVariant();
    const { t } = useTranslation(namespace);
    const predicted = useAtomValue(predictedIndex);
    const fatal = useAtomValue(fatalWebcam);

    useActiveNode('widget-output-in', true);

    const doDeployClick = useCallback(() => {
        setP2PEnabled(true);
    }, [setP2PEnabled]);

    return (
        <Widget
            noPadding
            dataWidget={'output'}
            title={t('output.labels.title')}
            className={style.widget}
            {...props}
            menu={
                allowDeploy &&
                !fatal && (
                    <a
                        className={style.deployLink}
                        href={`/deploy/${usep2p ? 'p' : 'b'}/${code}?p=${pwd}&qr=${enableCollaboration ? '1' : '0'}`}
                        target="_blank"
                        aria-label={t('output.aria.expand')}
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
                    aria-label={t('output.aria.volume')}
                    value={volume}
                    onChange={changeVolume}
                />
                <VolumeUp />
            </div>
        </Widget>
    );
}
