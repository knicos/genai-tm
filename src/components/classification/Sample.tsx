import React, { useRef, useEffect, useCallback } from 'react';
import style from './classification.module.css';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import MIconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useVariant } from '../../util/variant';

const IconButton = styled(MIconButton)({
    position: 'absolute',
    top: '0px',
    left: '0px',
    color: 'white',
});

interface Props {
    image: HTMLCanvasElement;
    onDelete: (index: number) => void;
    index: number;
}

export default function Sample({ image, index, onDelete }: Props) {
    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);
    const ref = useRef<HTMLImageElement>(null);

    useEffect(() => {
        if (ref.current && image) {
            ref.current.src = image.toDataURL();
            if (image.hasAttribute('data-testid')) {
                ref.current.setAttribute('data-testid', image.getAttribute('data-testid') || '');
            }
        }
    }, [image]);

    const doClick = useCallback(() => onDelete(index), [onDelete, index]);

    return (
        <li
            className={style.sampleImage}
            data-testid={`sample-${index}`}
        >
            <IconButton
                aria-label={t<string>('trainingdata.aria.delete')}
                onClick={doClick}
            >
                <DeleteForeverIcon />
            </IconButton>
            <img
                ref={ref}
                alt={t<string>('trainingdata.aria.sample')}
            />
        </li>
    );
}
