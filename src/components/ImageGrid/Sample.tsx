import { useRef, useEffect, useCallback } from 'react';
import style from './style.module.css';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import MIconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useVariant } from '../../util/variant';
import CircularProgress from '@mui/material/CircularProgress';

export type SampleStateValue = 'pending' | 'added' | 'deleted';

const IconButton = styled(MIconButton)({
    position: 'absolute',
    top: '0px',
    left: '0px',
    color: 'white',
});

interface Props {
    image: HTMLCanvasElement;
    onDelete?: (index: number) => void;
    index: number;
    status: SampleStateValue;
    disabled?: boolean;
}

export interface SampleState {
    data: HTMLCanvasElement;
    id: string;
    state: SampleStateValue;
}

export default function Sample({ image, index, onDelete, status, disabled }: Props) {
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

    const doClick = useCallback(() => {
        if (onDelete) onDelete(index);
    }, [onDelete, index]);

    return (
        <div
            className={style[`sampleImage-${status}`]}
            data-testid={`sample-${index}`}
        >
            {onDelete && (
                <IconButton
                    aria-label={t<string>('trainingdata.aria.delete')}
                    onClick={doClick}
                    disabled={disabled}
                >
                    <DeleteForeverIcon />
                </IconButton>
            )}
            <img
                ref={ref}
                alt={''}
            />
            {status === 'pending' && <CircularProgress size="30%" />}
        </div>
    );
}
