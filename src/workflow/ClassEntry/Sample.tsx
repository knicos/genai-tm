import { useRef, useEffect, useCallback } from 'react';
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
    padding: 0,
    '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    transition: 'all 0.2s ease-in-out',
});

interface Props {
    image?: HTMLCanvasElement;
    onDelete: (index: number) => void;
    onClick?: (index: number) => void;
    index: number;
}

export default function Sample({ image, index, onDelete, onClick }: Props) {
    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);
    const ref = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (ref.current && image) {
            const ctx = ref.current.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, ref.current.width, ref.current.height);
                ctx.drawImage(image, 0, 0, ref.current.width, ref.current.height);
            }
            if (image.hasAttribute('data-testid')) {
                ref.current.setAttribute('data-testid', image.getAttribute('data-testid') || '');
            }
        }
    }, [image]);

    const doClick = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            onDelete(index);
        },
        [onDelete, index]
    );

    const handleImageClick = useCallback(
        (e: React.MouseEvent) => {
            if (onClick) {
                e.stopPropagation();
                onClick(index);
            }
        },
        [onClick, index]
    );

    return (
        <li
            className={style.sampleImage}
            data-testid={`sample-${index}`}
            style={{ cursor: onClick ? 'pointer' : 'default' }}
        >
            <IconButton
                aria-label={t('trainingdata.aria.delete')}
                onClick={doClick}
            >
                <DeleteForeverIcon />
            </IconButton>

            <canvas
                ref={ref}
                onClick={handleImageClick}
                width={58}
                height={58}
                role="img"
            />
        </li>
    );
}
