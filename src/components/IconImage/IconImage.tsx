import React, { useEffect, useRef, useCallback } from 'react';
import MIconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import style from './IconImage.module.css';

const IconButton = styled(MIconButton)({
    position: 'absolute',
    top: '0px',
    left: '0px',
    color: 'white',
});

interface Props {
    src: string | HTMLCanvasElement;
    onDelete?: () => void;
    width?: number;
    height?: number;
}

export default function IconImage({ src, onDelete }: Props) {
    const ref = useRef<HTMLDivElement>(null);

    const isUrl = typeof src === 'string';

    useEffect(() => {
        if (!isUrl && ref.current) {
            while (ref.current.firstChild) {
                ref.current.removeChild(ref.current.firstChild);
            }
            ref.current.appendChild(src);
        }
    }, [src, isUrl]);

    const doClick = useCallback(() => (onDelete ? onDelete() : null), [onDelete]);

    return (
        <div className={style.container}>
            {!!onDelete && (
                <IconButton
                    aria-label="delete"
                    onClick={doClick}
                >
                    <DeleteForeverIcon />
                </IconButton>
            )}
            {isUrl ? (
                <img
                    src={src}
                    alt=""
                />
            ) : (
                <div ref={ref} />
            )}
        </div>
    );
}
