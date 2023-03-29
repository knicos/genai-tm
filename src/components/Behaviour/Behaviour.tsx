import React, { useState, useCallback } from 'react';
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

type BehaviourTypes = 'image' | 'sound' | 'speech' | 'text';

export interface BehaviourType {
    image?: ImageBehaviour;
    audio?: AudioBehaviour;
    text?: TextBehaviour;
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
    const { soundBehaviours, imageBehaviours, multipleBehaviours } = useVariant();
    const [value, setValue] = useState<BehaviourTypes>(imageBehaviours ? 'image' : 'sound');

    const handleChange = useCallback(
        (event: React.MouseEvent<HTMLElement>, newType: BehaviourTypes | null) => {
            if (newType !== null) setValue(newType);
        },
        [setValue]
    );

    const doSetBehaviour = useCallback(
        (image: ImageBehaviour | undefined) => {
            setBehaviour(multipleBehaviours ? { ...behaviour, image } : { image }, index);
        },
        [setBehaviour, behaviour, multipleBehaviours, index]
    );

    const doSetAudioBehaviour = useCallback(
        (audio: AudioBehaviour | undefined) => {
            setBehaviour(multipleBehaviours ? { ...behaviour, audio } : { audio }, index);
        },
        [setBehaviour, behaviour, multipleBehaviours, index]
    );

    const doSetTextBehaviour = useCallback(
        (text: TextBehaviour | undefined) => {
            setBehaviour(multipleBehaviours ? { ...behaviour, text } : { text }, index);
        },
        [setBehaviour, behaviour, multipleBehaviours, index]
    );

    return (
        <Widget
            dataWidget="behaviour"
            title={classLabel}
            className={style.widget}
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
                    {imageBehaviours && (
                        <ToggleButton
                            value="image"
                            aria-label="Image behaviour"
                            data-testid="image-option"
                        >
                            <ImageIcon />
                        </ToggleButton>
                    )}
                    {soundBehaviours && (
                        <ToggleButton
                            value="sound"
                            aria-label="Sound behaviour"
                            data-testid="audio-option"
                        >
                            <MusicNoteIcon />
                        </ToggleButton>
                    )}
                    <ToggleButton
                        value="text"
                        aria-label="Text behaviour"
                        data-testid="text-option"
                    >
                        <TextSnippetIcon />
                    </ToggleButton>
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
                        behaviour={behaviour.text}
                        setBehaviour={doSetTextBehaviour}
                    />
                )}
            </div>
        </Widget>
    );
}
