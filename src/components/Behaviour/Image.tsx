import React, { useCallback } from "react";
import style from "./Behaviour.module.css";
import EditIcon from '@mui/icons-material/Edit';
import { useDropzone } from "react-dropzone";
import IconButton from "@mui/material/IconButton";
import { Skeleton } from "@mui/material";
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

export interface ImageBehaviour {
    uri: string;
};

interface Props {
    behaviour?: ImageBehaviour;
    setBehaviour: (behaviour: ImageBehaviour | undefined) => void;
}

export default function Image({behaviour, setBehaviour}: Props) {
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

    const doDelete = useCallback(() => {
        setBehaviour(undefined)
    }, [setBehaviour]);

    return <div className={(isDragActive) ? style.imageContainerdrop : style.imageContainer} {...getRootProps()}>
        <IconButton color="default" onClick={open}>
            <EditIcon />
        </IconButton>
        <IconButton color="default" onClick={doDelete} disabled={!behaviour}>
            <DeleteForeverIcon />
        </IconButton>
        <input {...getInputProps()} />
        {behaviour && <img className={style.image} src={behaviour.uri} width={80} alt={""}/>}
        {!behaviour && <Skeleton variant="rounded" width={80} height={80} />}
    </div>;
}