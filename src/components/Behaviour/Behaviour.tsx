import React, { useState, useCallback, useRef, useEffect, RefObject } from 'react';
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
import { useDrop } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';
import AlertModal from '../AlertModal/AlertModal';
import { useAtomValue } from 'jotai';
import { predictedIndex } from '@genaitm/state';
import { useActiveNode } from '@genaitm/util/nodes';

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
    const [showDropError, setShowDropError] = useState(false);
    const predicted = useAtomValue(predictedIndex);

    useActiveNode(`widget-behaviour${index}-in`, predicted === index);
    useActiveNode(`widget-behaviour${index}-out`, predicted === index);

    const patchBehaviour = useCallback(
        (newBehaviour: Partial<BehaviourType>) => {
            setBehaviour(
                {
                    ...behaviour,
                    ...newBehaviour,
                    label: classLabel,
                },
                index
            );
        },
        [setBehaviour, index, behaviour, classLabel]
    );

    const [dropProps, drop] = useDrop({
        accept: [NativeTypes.FILE, NativeTypes.URL, NativeTypes.HTML],
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async drop(items: any) {
            if (items.html) {
                const root = document.createElement('html');
                root.innerHTML = items.html;
                const imgElements = root.getElementsByTagName('img');
                if (imgElements.length > 0) {
                    patchBehaviour({
                        image: { uri: imgElements[0].src },
                    });
                    setValue('image');
                }
            } else {
                const types = Array.from<DataTransferItem>(items.items).map((i) => i.type);
                const ix = types.findIndex((i) => i.startsWith('image/') || i.startsWith('audio/'));

                if (ix >= 0) {
                    const file = items.files[0];
                    const reader = new FileReader();
                    reader.onabort = () => console.warn('file reading aborted');
                    reader.onerror = () => console.error('file reading error');
                    reader.onload = () => {
                        if (file.type.startsWith('image/')) {
                            patchBehaviour({
                                image: { uri: reader.result as string },
                            });
                            setValue('image');
                        } else {
                            patchBehaviour({
                                audio: { uri: reader.result as string, name: file.name },
                            });
                            setValue('sound');
                        }
                    };
                    reader.readAsDataURL(file);
                } else {
                    const uri = types.findIndex((i) => i === 'text/uri-list');
                    if (uri >= 0) {
                        items.items[uri].getAsString((data: string) => {
                            const uris = data.split('\n');
                            patchBehaviour({
                                image: { uri: uris[0] },
                            });
                            setValue('image');
                        });
                    } else {
                        setShowDropError(true);
                    }
                }
            }
        },
        collect(monitor) {
            const can = monitor.canDrop();
            return {
                highlighted: can,
                hovered: monitor.isOver() && can,
            };
        },
    });

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
        (_: React.MouseEvent<HTMLElement>, newType: BehaviourTypes | null) => {
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

    const doDropErrorClose = useCallback(() => setShowDropError(false), [setShowDropError]);

    return (
        <Widget
            active={dropProps.hovered}
            dataWidget="behaviour"
            id={`behaviour${index}`}
            title={classLabel}
            className={style.widget}
            aria-label={t('behaviours.aria.behaviourCard', { name: classLabel })}
            {...props}
        >
            <div
                className={style.container}
                ref={drop as unknown as RefObject<HTMLDivElement>}
            >
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
                        aria-label={t('behaviours.aria.text')}
                        data-testid="text-option"
                    >
                        <TextSnippetIcon />
                    </ToggleButton>
                    {soundBehaviours && (
                        <ToggleButton
                            value="sound"
                            aria-label={t('behaviours.aria.sound')}
                            data-testid="audio-option"
                        >
                            <MusicNoteIcon />
                        </ToggleButton>
                    )}
                    {imageBehaviours && (
                        <ToggleButton
                            value="image"
                            aria-label={t('behaviours.aria.image')}
                            data-testid="image-option"
                        >
                            <ImageIcon />
                        </ToggleButton>
                    )}
                    {embedBehaviours && (
                        <ToggleButton
                            value="embed"
                            aria-label={t('behaviours.aria.embed')}
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
                        dropping={dropProps.hovered}
                    />
                )}
                {value === 'sound' && (
                    <Sound
                        behaviour={behaviour.audio}
                        setBehaviour={doSetAudioBehaviour}
                        dropping={dropProps.hovered}
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
            <AlertModal
                open={showDropError}
                onClose={doDropErrorClose}
                severity="error"
            >
                {t('behaviours.labels.dropError')}
            </AlertModal>
        </Widget>
    );
}
