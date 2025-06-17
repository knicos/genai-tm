import React, { useCallback, useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import style from './Behaviour.module.css';
import { useTranslation } from 'react-i18next';
import { useVariant } from '@genaitm/util/variant';
import Alignment, { Align } from '@genaitm/components/Alignment';
import TextColour from '@genaitm/components/TextColour/TextColour';
import FontSize from '@genaitm/components/FontSize/FontSize';

export interface TextBehaviour {
    text: string;
    align?: Align;
    color?: string;
    size?: number;
}

interface Props {
    id: string;
    behaviour?: TextBehaviour;
    setBehaviour: (behaviour: TextBehaviour | undefined) => void;
}

export default function Text({ id, behaviour, setBehaviour }: Props) {
    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);
    const [content, setContent] = useState('');

    const doChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            setContent(event.target.value);
        },
        [setContent]
    );

    useEffect(() => {
        setContent(behaviour?.text || '');
    }, [behaviour, setContent]);

    const doBlur = useCallback(() => {
        if (content) {
            setBehaviour({ ...behaviour, text: content });
        } else {
            setBehaviour(undefined);
        }
    }, [setBehaviour, behaviour, content]);

    const doSetAlignment = useCallback(
        (align: Align) => {
            if (behaviour) {
                setBehaviour({ ...behaviour, align });
            }
        },
        [setBehaviour, behaviour]
    );

    const doSetColour = useCallback(
        (col: string) => {
            if (behaviour) {
                setBehaviour({ ...behaviour, color: col });
            }
        },
        [setBehaviour, behaviour]
    );

    const doSetSize = useCallback(
        (size: number) => {
            if (behaviour) {
                setBehaviour({ ...behaviour, size });
            }
        },
        [behaviour, setBehaviour]
    );

    return (
        <div className={style.textContainer}>
            <TextField
                data-testid="text-message"
                label={t('behaviours.labels.message')}
                aria-label={t('behaviours.aria.message')}
                fullWidth
                id={`${id}-message`}
                size="small"
                variant="outlined"
                value={content}
                onChange={doChange}
                onBlur={doBlur}
                multiline
                maxRows={4}
                minRows={2}
            />
            <div className={style.row}>
                <Alignment
                    disabled={!behaviour}
                    alignment={behaviour?.align || 'center'}
                    setAlignment={doSetAlignment}
                />
                <TextColour
                    disabled={!behaviour}
                    colour={behaviour?.color || '#000000'}
                    setColour={doSetColour}
                />
                <FontSize
                    size={behaviour?.size || 30}
                    setSize={doSetSize}
                    disabled={!behaviour}
                />
            </div>
        </div>
    );
}
