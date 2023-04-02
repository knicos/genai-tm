import React, { useState, useCallback } from 'react';
import { Widget } from '../widget/Widget';
import { useTranslation } from 'react-i18next';
import style from './Output.module.css';
import { BehaviourType } from '../Behaviours/Behaviours';
import IconButton from '@mui/material/IconButton';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import { useVariant } from '../../util/variant';
import AudioPlayer from './AudioPlayer';
import Slider from '@mui/material/Slider';
import VolumeDown from '@mui/icons-material/VolumeDown';
import VolumeUp from '@mui/icons-material/VolumeUp';
import { useRecoilValue } from 'recoil';
import { predictedIndex } from '../../state';
import Embedding from './Embedding';

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
    const [expanded, setExpanded] = useState(false);
    const [volume, setVolume] = useState(100);
    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);
    const predicted = useRecoilValue(predictedIndex);

    const changeVolume = useCallback((event: Event, newValue: number | number[]) => {
        setVolume(newValue as number);
    }, []);

    const currentBehaviour = predicted < behaviours.length ? behaviours[predicted] : null;
    const hasImage = !!currentBehaviour?.image || !!currentBehaviour?.text;

    const scaleFactor = expanded
        ? Math.min(((window.innerHeight - MENUSPACE) * FULLSCREEN) / HEIGHT, (window.innerWidth * FULLSCREEN) / WIDTH)
        : 1.0;

    return (
        <Widget
            dataWidget={expanded ? '' : 'output'}
            title={t<string>('output.labels.title')}
            className={expanded ? style.widgetExpanded : style.widget}
            {...props}
            menu={
                <IconButton
                    aria-label="expand"
                    size="small"
                    onClick={() => setExpanded(!expanded)}
                >
                    {!expanded && <OpenInFullIcon fontSize="small" />}
                    {expanded && <CloseFullscreenIcon fontSize="small" />}
                </IconButton>
            }
        >
            <div
                style={{
                    width: `${Math.floor(400 * scaleFactor)}px`,
                    height: `${Math.floor(350 * scaleFactor)}px`,
                }}
            >
                <div
                    className={style.container}
                    style={{
                        transform: `scale(${scaleFactor})`,
                    }}
                >
                    {behaviours.map((behaviour, ix) => (
                        <React.Fragment key={ix}>
                            {behaviour?.image && (
                                <img
                                    data-testid="image-output"
                                    src={behaviour.image.uri}
                                    alt=""
                                    style={{ display: ix === predicted ? 'initial' : 'none' }}
                                />
                            )}
                            {behaviour?.audio && (
                                <AudioPlayer
                                    showIcon={!hasImage}
                                    volume={volume / 100}
                                    uri={behaviour.audio.uri}
                                    play={ix === predicted}
                                />
                            )}
                            {behaviour?.embed && (
                                <Embedding
                                    show={ix === predicted}
                                    volume={volume / 100}
                                    url={behaviour.embed.url}
                                />
                            )}
                            {behaviour?.text && (
                                <div
                                    className={style.textOverlay}
                                    data-testid="text-output"
                                    style={{
                                        fontSize: `${behaviour.text.size || 30}pt`,
                                        display: ix === predicted ? 'initial' : 'none',
                                        color: behaviour.text.color || '#000000',
                                        textAlign: behaviour.text.align || 'center',
                                    }}
                                >
                                    {behaviour.text.text}
                                </div>
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>
            <div className={style.volumeContainer}>
                <VolumeDown />
                <Slider
                    aria-label="Volume"
                    value={volume}
                    onChange={changeVolume}
                />
                <VolumeUp />
            </div>
        </Widget>
    );
}
