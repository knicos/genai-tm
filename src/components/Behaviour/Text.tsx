import React, { useCallback, useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import style from './Behaviour.module.css';
import { useTranslation } from 'react-i18next';
import { useVariant } from '../../util/variant';

export interface TextBehaviour {
    text: string;
    align?: 'left' | 'right' | 'center';
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
        </div>
    );
}
