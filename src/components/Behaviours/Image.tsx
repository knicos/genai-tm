import React, { useCallback } from "react";
import style from "./Behaviours.module.css";
import EditIcon from '@mui/icons-material/Edit';
import { useDropzone } from "react-dropzone";
import IconButton from "@mui/material/IconButton";

export interface ImageBehaviour {
    uri: string;
};

interface Props {
    label: string;
    behaviour: ImageBehaviour;
    setBehaviour: (behaviour: ImageBehaviour) => void;
}

export default function Image({label, behaviour, setBehaviour}: Props) {
    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length === 1) {
            const reader = new FileReader();
            reader.onabort = () => console.warn('file reading aborted');
            reader.onerror = () => console.error('file reading error');
            reader.onload= () => {
                setBehaviour({
                    uri: reader.result as string,
                });
            }
            reader.readAsDataURL(acceptedFiles[0]);
        }
    }, [setBehaviour]);

    const {getRootProps, getInputProps, isDragActive, open} = useDropzone({
        noClick: true,
        onDrop,
        accept: {
            "image/png": [".png"],
            "image/jpeg": [".jpg", ".jpeg"],
            "image/gif": [".gif"],
        },
        maxFiles: 1,
    });

    return <li className={(isDragActive) ? style.imageContainerdrop : style.imageContainer} {...getRootProps()}>
        <h2>{label}</h2>
        <IconButton color="default" onClick={open}>
            <EditIcon />
        </IconButton>
        <input {...getInputProps()} />
        <img className={style.image} src={behaviour.uri} width={80} alt={""}/>
    </li>;
}