import React, { useRef, useEffect, useCallback } from 'react';
import style from './classification.module.css';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import MIconButton from '@mui/material/IconButton';
import { styled } from '@mui/material/styles';

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
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (ref.current && image) {
            while (ref.current.firstChild) {
                ref.current.removeChild(ref.current.firstChild);
            }
            ref.current.appendChild(image);
        }
    }, [image]);

    const doClick = useCallback(() => onDelete(index), [onDelete, index]);

    return (
        <li className={style.sampleImage}>
            <IconButton
                aria-label="delete"
                onClick={doClick}
            >
                <DeleteForeverIcon />
            </IconButton>
            <div ref={ref} />
        </li>
    );
}
