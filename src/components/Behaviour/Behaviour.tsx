import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Widget } from '../widget/Widget';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Image, { ImageBehaviour } from '../Behaviour/Image';
import ImageIcon from '@mui/icons-material/Image';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import style from './Behaviour.module.css';
import Sound, { AudioBehaviour } from './Audio';
import { useVariant } from '../../util/variant';
import Text, { TextBehaviour } from './Text';
import Embed, { EmbedBehaviour } from './Embed';
import LinkIcon from '@mui/icons-material/Link';
import { useTranslation } from 'react-i18next';

type BehaviourTypes = 'image' | 'sound' | 'speech' | 'text' | 'embed';

export interface BehaviourType {
    image?: ImageBehaviour;
    audio?: AudioBehaviour;
    text?: TextBehaviour;
    embed?: EmbedBehaviour;
    label: string;
}

interface Props {
    classLabel: string;
    behaviour: BehaviourType;
    setBehaviour: (newBehaviour: BehaviourType, ix: number) => void;
    disabled?: boolean;
    hidden?: boolean;
    focus?: boolean;
    'data-testid'?: string;
    index: number;
}

export default function Behaviour({ classLabel, behaviour, setBehaviour, index, ...props }: Props) {
    const { soundBehaviours, imageBehaviours, multipleBehaviours, embedBehaviours, namespace } = useVariant();
    const { t } = useTranslation(namespace);
    const [value, setValue] = useState<BehaviourTypes>('text');
    const prevLabel = useRef(classLabel);

    useEffect(() => {
        if (behaviour.text?.text === prevLabel.current && behaviour.text?.text !== classLabel) {
            const mutated = { ...behaviour, text: { ...behaviour.text } };
            if (mutated.text) {
                mutated.text.text = classLabel;
            }
            setBehaviour(mutated, index);
        }
        prevLabel.current = classLabel;
    }, [classLabel, behaviour, setBehaviour, index]);

    const handleChange = useCallback(
        (event: React.MouseEvent<HTMLElement>, newType: BehaviourTypes | null) => {
            if (newType !== null) setValue(newType);
        },
        [setValue]
    );

    const doSetBehaviour = useCallback(
        (image: ImageBehaviour | undefined) => {
            setBehaviour(multipleBehaviours ? { ...behaviour, image } : { label: classLabel, image }, index);
        },
        [setBehaviour, behaviour, multipleBehaviours, index, classLabel]
    );

    const doSetAudioBehaviour = useCallback(
        (audio: AudioBehaviour | undefined) => {
            setBehaviour(multipleBehaviours ? { ...behaviour, audio } : { label: classLabel, audio }, index);
        },
        [setBehaviour, behaviour, multipleBehaviours, index, classLabel]
    );

    const doSetTextBehaviour = useCallback(
        (text: TextBehaviour | undefined) => {
            setBehaviour(multipleBehaviours ? { ...behaviour, text } : { label: classLabel, text }, index);
        },
        [setBehaviour, behaviour, multipleBehaviours, index, classLabel]
    );

    const doSetEmbedBehaviour = useCallback(
        (embed: EmbedBehaviour | undefined) => {
            setBehaviour({ ...behaviour, image: undefined, audio: undefined, embed }, index);
        },
        [setBehaviour, index, behaviour]
    );

    return (
        <Widget
            dataWidget="behaviour"
            title={classLabel}
            className={style.widget}
            aria-label={t<string>('behaviours.aria.behaviourCard', { name: classLabel })}
            {...props}
        >
            <div className={style.container}>
                <ToggleButtonGroup
                    value={value}
                    onChange={handleChange}
                    exclusive
                    color="primary"
                    fullWidth
                    size="small"
                    sx={{ margin: '1rem 0' }}
                >
                    <ToggleButton
                        value="text"
                        aria-label={t<string>('behaviours.aria.text')}
                        data-testid="text-option"
                    >
                        <TextSnippetIcon />
                    </ToggleButton>
                    {soundBehaviours && (
                        <ToggleButton
                            value="sound"
                            aria-label={t<string>('behaviours.aria.sound')}
                            data-testid="audio-option"
                        >
                            <MusicNoteIcon />
                        </ToggleButton>
                    )}
                    {imageBehaviours && (
                        <ToggleButton
                            value="image"
                            aria-label={t<string>('behaviours.aria.image')}
                            data-testid="image-option"
                        >
                            <ImageIcon />
                        </ToggleButton>
                    )}
                    {embedBehaviours && (
                        <ToggleButton
                            value="embed"
                            aria-label={t<string>('behaviours.aria.embed')}
                            data-testid="embed-option"
                        >
                            <LinkIcon />
                        </ToggleButton>
                    )}
                </ToggleButtonGroup>
                {value === 'image' && (
                    <Image
                        behaviour={behaviour.image}
                        setBehaviour={doSetBehaviour}
                    />
                )}
                {value === 'sound' && (
                    <Sound
                        behaviour={behaviour.audio}
                        setBehaviour={doSetAudioBehaviour}
                    />
                )}
                {value === 'text' && (
                    <Text
                        id={`behaviour-${index}`}
                        behaviour={behaviour.text}
                        setBehaviour={doSetTextBehaviour}
                    />
                )}
                {value === 'embed' && (
                    <Embed
                        behaviour={behaviour.embed}
                        setBehaviour={doSetEmbedBehaviour}
                        firstBehaviour={index === 0}
                    />
                )}
            </div>
        </Widget>
    );
}
