import React from 'react';
import { BehaviourType } from '../Behaviour/Behaviour';
import AudioPlayer from './AudioPlayer';
import Embedding from './Embedding';
import style from './Output.module.css';
import { useVariant } from '../../util/variant';
import { useTranslation } from 'react-i18next';
import CircularProgress from '@mui/material/CircularProgress';
import { useTabActive } from '../../util/useTabActive';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';

interface Props extends React.PropsWithChildren {
    scaleFactor: number;
    behaviours: BehaviourType[];
    predicted: number;
    volume: number;
    error?: string;
}

export default function RawOutput({ scaleFactor, behaviours, predicted, volume, error, children }: Props) {
    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);
    const isActive = useTabActive();

    const currentBehaviour = predicted < behaviours.length ? behaviours[predicted] : null;
    const hasImage = !!currentBehaviour?.image || !!currentBehaviour?.text;

    return (
        <div
            style={{
                width: `${Math.floor(400 * scaleFactor)}px`,
                height: `${Math.floor(350 * scaleFactor)}px`,
            }}
        >
            <div
                aria-label={t<string>('output.aria.display', { index: predicted + 1 })}
                className={style.container}
                style={{
                    transform: `scale(${scaleFactor})`,
                }}
            >
                {error && (
                    <>
                        <SentimentVeryDissatisfiedIcon className={style.errorIcon} />
                        <span className={style.errorMessage}>{error}</span>
                    </>
                )}
                {!error && (behaviours.length === 0 || predicted < 0) && <CircularProgress />}
                {!error &&
                    behaviours.map((behaviour, ix) => (
                        <React.Fragment key={ix}>
                            {behaviour?.image && (
                                <img
                                    aria-hidden={ix !== predicted}
                                    data-testid="image-output"
                                    src={behaviour.image.uri}
                                    alt={t<string>('output.aria.image', { index: predicted + 1 })}
                                    style={{ display: ix === predicted ? 'initial' : 'none' }}
                                />
                            )}
                            {behaviour?.audio && (
                                <AudioPlayer
                                    showIcon={!hasImage}
                                    volume={volume / 100}
                                    uri={behaviour.audio.uri}
                                    play={ix === predicted && isActive}
                                    loop={behaviour.audio.loop}
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
                                <p
                                    className={style.textOverlay}
                                    data-testid="text-output"
                                    style={{
                                        fontSize: `${behaviour.text.size || 30}pt`,
                                        display: ix === predicted ? 'initial' : 'none',
                                        color: behaviour.text.color || '#000000',
                                        textAlign: behaviour.text.align || 'center',
                                    }}
                                    aria-hidden={ix !== predicted}
                                >
                                    {behaviour.text.text}
                                </p>
                            )}
                        </React.Fragment>
                    ))}
                {children}
            </div>
        </div>
    );
}
