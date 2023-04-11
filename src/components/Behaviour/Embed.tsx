import React, { useCallback, useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import style from './Behaviour.module.css';
import { useTranslation } from 'react-i18next';
import { useVariant } from '../../util/variant';
import YouTubeIcon from '@mui/icons-material/YouTube';
import BlockIcon from '@mui/icons-material/Block';
import ImageIcon from '@mui/icons-material/Image';
import Alert from '@mui/material/Alert';
import LinkIcon from '@mui/icons-material/Link';
import { linkType, LinkDetails } from './links';
import VideocamIcon from '@mui/icons-material/Videocam';

export interface EmbedBehaviour {
    url: string;
}

interface Props {
    behaviour?: EmbedBehaviour;
    setBehaviour: (behaviour: EmbedBehaviour | undefined) => void;
    firstBehaviour?: boolean;
}

export default function Embed({ behaviour, setBehaviour, firstBehaviour }: Props) {
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
        setContent(behaviour?.url || '');
    }, [behaviour, setContent]);

    const details: LinkDetails = content ? linkType(content) : { type: 'invalid' };

    const doBlur = useCallback(() => {
        if (content) {
            const type = linkType(content).type;
            if (type !== 'invalid' && type !== 'plain') {
                setBehaviour({ ...behaviour, url: content });
            } else {
            }
        } else {
            setBehaviour(undefined);
        }
    }, [setBehaviour, behaviour, content]);

    return (
        <div className={style.textContainer}>
            <div className={style.linkRow}>
                {details.type === 'youtube' && <YouTubeIcon fontSize="large" />}
                {details.type === 'image' && (
                    <ImageIcon
                        data-testid="image-link-icon"
                        color="success"
                        fontSize="large"
                    />
                )}
                {details.type === 'invalid' && <LinkIcon fontSize="large" />}
                {details.type === 'plain' && (
                    <BlockIcon
                        color="error"
                        fontSize="large"
                    />
                )}
                {details.type === 'video' && (
                    <VideocamIcon
                        color="success"
                        fontSize="large"
                    />
                )}
                <TextField
                    data-testid="link-message"
                    label={t('behaviours.labels.link')}
                    fullWidth
                    id="link"
                    size="small"
                    variant="outlined"
                    value={content}
                    onChange={doChange}
                    onBlur={doBlur}
                />
            </div>
            {details.type === 'plain' && (
                <Alert severity="error">
                    <p>{t('behaviours.labels.linkError')}</p>
                </Alert>
            )}
            {firstBehaviour && (
                <Alert severity="info">
                    <p>{t('behaviours.labels.embedInfo')}</p>
                </Alert>
            )}
        </div>
    );
}
