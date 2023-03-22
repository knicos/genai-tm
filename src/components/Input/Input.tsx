import React, { useState } from "react";
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { Widget } from "../widget/Widget";
import { Webcam } from "../webcam/Webcam";
import style from "./Input.module.css";
import { useTranslation } from "react-i18next";
import { useVariant } from "../../util/variant";
import { Skeleton } from "@mui/material";

interface Props {
    disabled?: boolean;
    hidden?: boolean;
    enabled?: boolean;
    onCapture: (img: HTMLCanvasElement) => void;
}

export default function Input({enabled, onCapture, ...props}: Props) {
    const {namespace} = useVariant();
    const {t} = useTranslation(namespace);
    const [enableInput, setEnableInput] = useState(true);
    return <Widget dataWidget="input" title="Input" {...props}>
        <div className={style.container}>
            <div className={style.inputControls}>
                <FormControlLabel labelPlacement="start" control={
                    <Switch
                        disabled={!enabled}
                        checked={enableInput}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
                            setEnableInput(checked);   
                        }}
                    />} label={t<string>("model.labels.webcam")} />
            </div>
            <div className={style.inputContainer}>
                {enabled && <Webcam disable={!enableInput} capture={enableInput && enabled} interval={200} onCapture={onCapture}/>}
                {!enabled && <Skeleton variant="rounded" width={224} height={224} />}
            </div>
        </div>
    </Widget>;
}