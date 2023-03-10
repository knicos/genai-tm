import { TeachableMobileNet } from "@teachablemachine/image";
import React, { useState } from "react";
import { Webcam } from "../webcam/Webcam";
import { Widget } from "../widget/Widget";
import PercentageBar, {Colours} from "../PercentageBar/PercentageBar";
import style from "./Preview.module.css";

interface IPrediction {
    className: string;
    probability: number;
}

interface Props {
    model?: TeachableMobileNet;
}

const colourWheel: Colours[] = [
    'orange',
    'purple',
    'blue',
    'green',
    'red',
];

export function Preview({model}: Props) {
    const [lastPrediction, setLastPrediction] = useState<IPrediction[]>([])

    const doPrediction = async (image: HTMLCanvasElement) => {
        if (model) {
            const prediction = await model.predict(image);
            setLastPrediction(prediction);
        }
    }

    return <Widget title="Machine">
        {model &&
            <div className={style.previewContainer}>
                <Webcam capture={!!model} interval={200} onCapture={doPrediction}/>
                <table className={style.table}>
                    <tbody>
                        {lastPrediction.map((p, ix) => <tr key={ix}>
                            <td className={style.labelCell}>{p.className}</td>
                            <td className={style.valueCell}><PercentageBar
                                colour={colourWheel[ix % colourWheel.length]}
                                value={p.probability * 100}
                            /></td>
                        </tr>)}
                    </tbody>
                </table>
            </div>
        }
        {!model &&
            <p>You must train your machine first.</p>
        }
    </Widget>
}
