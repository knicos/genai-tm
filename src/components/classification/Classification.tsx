import React, { useRef } from "react";
import style from "./classification.module.css";
import { IClassification, stateClassifications } from "../../state";
import { Button } from "../button/Button";
import { Widget } from "../widget/Widget";
import Sample from "./Sample";
import WebcamCapture from "./WebcamCapture";
import VideocamIcon from '@mui/icons-material/Videocam';

interface Props {
    name: string;
    active: boolean;
    onActivate?: () => void;
    data: IClassification;
    setData: (data: IClassification) => void;
    setActive: (active: boolean) => void;
}

export function Classification({name, active, data, setData, onActivate, setActive}: Props) {
    return <Widget title={name}>
        <div className={style.container}>
        {(active) ? <WebcamCapture visible={true} onCapture={(image) => {
            image.style.width = "58px";

            setData({
                label: name,
                samples: [...data.samples, image],
            });
        }} onClose={() => setActive(false)}/> : null}
        {!active && <div className={style.buttoncontainer}>
            <Button variant="outlined" startIcon={<VideocamIcon />} onClick={onActivate}>Webcam</Button>
        </div>}
        <ol className={style.samplelist}>
            {data.samples.map((s, ix) => <Sample key={ix} image={s} />)}
        </ol>
        </div>
    </Widget>;
}