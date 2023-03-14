import React from "react";
import style from "./Behaviours.module.css";
import EditIcon from '@mui/icons-material/Edit';
import MIconButton from "@mui/material/IconButton";
import { styled } from '@mui/material/styles';

const IconButton = styled(MIconButton)({
    position: "absolute",
    top: "5px",
    right: "5px",
    color: "white",
});

export interface ImageBehaviour {
    uri: string;
};

interface Props {
    label: string;
    behaviour: ImageBehaviour;
    setBehaviour: (behaviour: ImageBehaviour) => void;
}

export default function Image({label, behaviour, setBehaviour}: Props) {
    return <li className={style.imageContainer}>
        <h2>{label}</h2>
        <IconButton aria-label="edit" size="medium">
            <EditIcon fontSize="medium"/>
        </IconButton>
        <img className={style.image} src={behaviour.uri} width={80} alt={""}/>
    </li>;
}