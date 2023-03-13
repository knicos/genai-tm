import React, { useRef, useEffect } from "react";
import style from "./classification.module.css";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import MIconButton from "@mui/material/IconButton";
import { styled } from '@mui/material/styles';

const IconButton = styled(MIconButton)({
    position: "absolute",
    top: "0px",
    left: "0px",
    color: "white",
});

interface Props {
    image: HTMLCanvasElement;
    onDelete: () => void;
}

export default function Sample({image, onDelete}: Props) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (ref.current && image) {
            while (ref.current.firstChild) {
                ref.current.removeChild(ref.current.firstChild);
            }
            ref.current.appendChild(image);
        }
    }, [image]);

    return <li className={style.sampleImage}>
        <IconButton aria-label="delete" onClick={onDelete}>
            <DeleteForeverIcon />
        </IconButton>
        <div ref={ref} />
    </li>
}