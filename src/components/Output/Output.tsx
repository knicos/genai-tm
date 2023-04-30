import React, { useState, useCallback } from 'react';
import { Widget } from '../widget/Widget';
import { useTranslation } from 'react-i18next';
import style from './Output.module.css';
import { BehaviourType } from '../Behaviours/Behaviours';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useVariant } from '../../util/variant';
import { useRecoilValue } from 'recoil';
import { predictedIndex, sessionCode } from '../../state';
import RawOutput from './RawOutput';
import Slider from '@mui/material/Slider';
import VolumeDown from '@mui/icons-material/VolumeDown';
import VolumeUp from '@mui/icons-material/VolumeUp';

const WIDTH = 400;
const HEIGHT = 350;
const FULLSCREEN = 0.75;
const MENUSPACE = 150;

interface Props {
    behaviours: BehaviourType[];
    focus?: boolean;
    disabled?: boolean;
    hidden?: boolean;
}

export default function Output({ behaviours, ...props }: Props) {
    const code = useRecoilValue(sessionCode);
    const [volume, setVolume] = useState(100);
    const changeVolume = useCallback((event: Event, newValue: number | number[]) => {
        setVolume(newValue as number);
    }, []);

    const { namespace, allowDeploy, usep2p } = useVariant();
    const { t } = useTranslation(namespace);
    const predicted = useRecoilValue(predictedIndex);

    return (
        <Widget
            dataWidget={'output'}
            title={t<string>('output.labels.title')}
            className={style.widget}
            {...props}
            menu={
                allowDeploy && (
                    <a
                        className={style.deployLink}
                        href={`/deploy/${usep2p ? 'p' : 'b'}/${code}`}
                        target="_blank"
                        aria-label={t<string>('output.aria.expand')}
                        rel="noreferrer"
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
