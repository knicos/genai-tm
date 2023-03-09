import React, { useRef } from "react";
import { useSetRecoilState } from "recoil";
import { Webcam } from "../webcam/Webcam";
import style from "./classification.module.css";
import { IClassification, stateClassifications } from "../../state";
import { Button } from "../button/Button";
import { Widget } from "../widget/Widget";
import Sample from "./Sample";
import WebcamCapture from "./WebcamCapture";

interface Props {
    name: string;
    active: boolean;
    onActivate?: () => void;
    data: IClassification;
    setData: (data: IClassification) => void;
}

export function Classification({name, active, data, setData, onActivate}: Props) {
    return <Widget title={name}>
        <div className={style.container}>
        {(active) ? <WebcamCapture visible={true} onCapture={(image) => {
            image.style.width = "58px";

            setData({
                label: name,
                samples: [...data.samples, image],
            });
        }} /> : null}
        {!active && <Button onClick={onActivate}>Webcam</Button>}
        <ol className={style.samplelist}>
            {data.samples.map((s) => <Sample image={s} />)}
        </ol>
        </div>
    </Widget>;
}