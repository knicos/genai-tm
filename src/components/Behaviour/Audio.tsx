import React, { useCallback, useState, useEffect } from "react";
import style from "./Behaviour.module.css";
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useDropzone } from "react-dropzone";
import IconButton from "@mui/material/IconButton";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { VerticalButton } from "../button/Button";

export interface AudioBehaviour {
    uri: string;
    name: string;
};

interface Props {
    behaviour?: AudioBehaviour;
    setBehaviour: (behaviour: AudioBehaviour | undefined) => void;
}

export default function Sound({behaviour, setBehaviour}: Props) {
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length === 1) {
            const reader = new FileReader();
            reader.onabort = () => console.warn('file reading aborted');
            reader.onerror = () => console.error('file reading error');
            reader.onload= () => {
                setBehaviour({
                    uri: reader.result as string,
                    name: acceptedFiles[0].name,
                });
            }
            reader.readAsDataURL(acceptedFiles[0]);
        }
    }, [setBehaviour]);

    const {getRootProps, getInputProps, isDragActive, open} = useDropzone({
        noClick: true,
        onDrop,
        accept: {
            "audio/mpeg": [".mp3"],
            "audio/ogg": [".oga"],
            "audio/opus": [".opus"],
            "audio/wav": [".wav"],
            "audio/aac": [".aac"],
        },
        maxFiles: 1,
    });

    const doPlay = useCallback(() => setAudio((old: HTMLAudioElement | null) => {
        if (old) return old;
        if (!behaviour?.uri) return null;

        const a = new Audio(behaviour.uri);
        setAudio(a);
        a.loop = true;
        a.play();
        return a;
    }), [setAudio, behaviour]);

    const doStop = useCallback(() => setAudio((old: HTMLAudioElement | null) => {
        if (!old) return null;
        old.pause();
        return null;
    }), [setAudio]);

    useEffect(doStop, [doStop, behaviour]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => () => doStop(), []);

    const doDelete = useCallback(() => {
        setBehaviour(undefined)
    }, [setBehaviour]);


    return <>
        <h3>{behaviour?.name}</h3>
        <div className={(isDragActive) ? style.imageContainerdrop : style.imageContainer} {...getRootProps()}>
            <VerticalButton variant="outlined" onClick={open} startIcon={<UploadFileIcon/>}>Upload</VerticalButton>
            <VerticalButton variant="outlined" disabled={!behaviour} onClick={doDelete} startIcon={<DeleteForeverIcon />}>Delete</VerticalButton>
            <input {...getInputProps()} />
            {!audio && <IconButton disabled={!behaviour} color="primary" onClick={doPlay} size="large">
                <PlayArrowIcon fontSize="large" />
            </IconButton>}
            {audio && <IconButton color="primary" onClick={doStop} size="large">
                <StopIcon fontSize="large" />
            </IconButton>}
        </div>
    </>;
}