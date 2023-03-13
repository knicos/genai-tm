import { TeachableMobileNet } from "@teachablemachine/image";
import React, { useState } from "react";
import { Webcam } from "../webcam/Webcam";
import { Widget } from "../widget/Widget";
import PercentageBar, {Colours} from "../PercentageBar/PercentageBar";
import style from "./Preview.module.css";
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { Button } from "../button/Button";
import DownloadIcon from '@mui/icons-material/Download';

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
    const [enableInput, setEnableInput] = useState(true);
    const [lastPrediction, setLastPrediction] = useState<IPrediction[]>([])

    const doPrediction = async (image: HTMLCanvasElement) => {
        if (model) {
            const prediction = await model.predict(image);
            setLastPrediction(prediction);
        }
    }

    return <Widget title="Model" className={style.widget}>
        {model &&
            <div className={style.previewContainer}>
                <div className={style.inputControls}>
                    <FormControlLabel labelPlacement="start" control={
                        <Switch
                            checked={enableInput}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
                                setEnableInput(checked);   
                            }}
                        />} label="Webcam" />
                </div>
                <div className={style.inputContainer}>
                    <Webcam disable={!enableInput} capture={enableInput && !!model} interval={200} onCapture={doPrediction}/>
                </div>
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
                <div className={style.buttonContainer}>
                    <Button sx={{width: "100%"}} startIcon={<DownloadIcon/>} variant="outlined" onClick={() => {
                        model.save("downloads://my-model");
                    }}>Export</Button>
                </div>
            </div>
        }
        {!model &&
            <p>You must train your model first.</p>
        }
    </Widget>
}
