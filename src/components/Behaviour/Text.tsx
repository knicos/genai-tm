import React, { useCallback, useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import style from './Behaviour.module.css';
import { useTranslation } from 'react-i18next';
import { useVariant } from '../../util/variant';
import Alignment, { Align } from '../Alignment/Alignment';
import TextColour from '../TextColour/TextColour';

export interface TextBehaviour {
    text: string;
    align?: Align;
    color?: string;
}

interface Props {
    behaviour?: TextBehaviour;
    setBehaviour: (behaviour: TextBehaviour | undefined) => void;
}

export default function Text({ behaviour, setBehaviour }: Props) {
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

    return (
        <div className={style.textContainer}>
            <TextField
                data-testid="text-message"
                label={t('behaviours.labels.message')}
                fullWidth
                id="message"
                size="small"
                variant="outlined"
                value={content}
                onChange={doChange}
                onBlur={doBlur}
                multiline
                maxRows={4}
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
            </div>
        </div>
    );
}