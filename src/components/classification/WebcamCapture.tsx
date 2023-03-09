import React, {useState} from "react";
import { Button } from "../button/Button";
import { Webcam } from "../webcam/Webcam";
import style from "./classification.module.css";

interface Props {
    visible?: boolean;
    onCapture: (image: HTMLCanvasElement) => void;
}

export default function WebcamCapture({visible, onCapture}: Props) {
    const [capturing, setCapturing] = useState(false);
    return (visible) ? <div className={style.webcamwindow}>
        <h2 className={style.webcamtitle}>Webcam</h2>
        <div className={style.webcamcontainer}>
            <Webcam capture={capturing} onCapture={(image: HTMLCanvasElement) => {
                setCapturing(false);
                onCapture(image);
            }} interval={1000} />
        </div>
        <Button variant="contained" disabled={capturing} onClick={() => setCapturing(true)}>
            {(capturing) ? "Wait..." : "Capture in 1s"}
        </Button>
    </div> : null;
}