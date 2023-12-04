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

function hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
          }
        : null;
}

function bgColour(colour: string): string {
    const col = hexToRgb(colour);
    if (!col) return 'white';
    const Y = 0.2126 * col.r + 0.7152 * col.g + 0.0722 * col.b;
    return Y < 128 ? 'white' : 'black';
}

export default function RawOutput({ scaleFactor, behaviours, predicted, volume, error, children }: Props) {
    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);
    const isActive = useTabActive();

    const currentBehaviour = predicted < behaviours.length ? behaviours[predicted] : null;
    const hasImage = !!currentBehaviour?.image || !!currentBehaviour?.text;

    // eslint-disable-next-line no-restricted-globals
    const realScaleFactor = screen.width < 400 * scaleFactor ? screen.width / 400 : scaleFactor;

    return (
        <div
            style={{
                width: `${Math.floor(400 * realScaleFactor)}px`,
                height: `${Math.floor(350 * realScaleFactor)}px`,
            }}
        >
            <div
                aria-label={t<string>('output.aria.display', { index: predicted + 1 })}
                className={style.container}
                style={{
                    transform: `scale(${realScaleFactor})`,
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
                                        left: behaviour.text.align === 'left' ? 0 : undefined,
                                        right: behaviour.text.align === 'right' ? 0 : undefined,
                                        textAlign: behaviour.text.align || 'center',
                                        backgroundColor: bgColour(behaviour.text.color || '#000000'),
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
