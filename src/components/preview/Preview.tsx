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
import { useTranslation } from "react-i18next";

interface IPrediction {
    className: string;
    probability: number;
}

interface Props {
    model?: TeachableMobileNet;
    onPrediction: (prediction: number) => void;
}

const colourWheel: Colours[] = [
    'orange',
    'purple',
    'blue',
    'green',
    'red',
];

export function Preview({model, onPrediction}: Props) {
    const {t} = useTranslation();
    const [enableInput, setEnableInput] = useState(true);
    const [lastPrediction, setLastPrediction] = useState<IPrediction[]>([])

    const doPrediction = async (image: HTMLCanvasElement) => {
        if (model) {
            const prediction = await model.predict(image);
            setLastPrediction(prediction);

            const nameOfMax = prediction.reduce((prev, val) => ((val.probability > prev.probability) ? val : prev));
            onPrediction(prediction.indexOf(nameOfMax));
        }
    }

    return <Widget dataWidget="model" title={t<string>("model.labels.title")} className={style.widget}>
        {model &&
            <div className={style.previewContainer}>
                <div className={style.inputControls}>
                    <FormControlLabel labelPlacement="start" control={
                        <Switch
                            checked={enableInput}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
                                setEnableInput(checked);   
                            }}
                        />} label={t<string>("model.labels.webcam")} />
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
                    }}>{t("model.actions.export")}</Button>
                </div>
            </div>
        }
        {!model &&
            <p>{t("model.labels.mustTrain")}</p>
        }
    </Widget>
}
