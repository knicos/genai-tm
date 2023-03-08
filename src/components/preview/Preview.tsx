import React, { useState } from "react";
import { useRecoilValue } from "recoil";
import { tfModel } from "../../state";
import { Webcam } from "../webcam/Webcam";

interface IPrediction {
    className: string;
    probability: number;
}

export function Preview() {
    const [lastPrediction, setLastPrediction] = useState<IPrediction[]>([])
    const model = useRecoilValue(tfModel);

    const doPrediction = async (image: HTMLCanvasElement) => {
        if (model) {
            const prediction = await model.predict(image);
            console.log(prediction);
            setLastPrediction(prediction);
        }
    }

    return <div>
        <Webcam capture={!!model} interval={200} onCapture={doPrediction}/>
        <ol>
            {lastPrediction.map((p) => <li>{`${p.className} ${p.probability}`}</li>)}
        </ol>
    </div>
}
