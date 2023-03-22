import { TeachableMobileNet } from "@teachablemachine/image";
import React from "react";
import { Widget } from "../widget/Widget";
import PercentageBar, {Colours} from "../PercentageBar/PercentageBar";
import style from "./Preview.module.css";
import { Button } from "../button/Button";
import DownloadIcon from '@mui/icons-material/Download';
import { useTranslation } from "react-i18next";
import { useVariant } from "../../util/variant";
import Alert from "@mui/material/Alert";

export interface IPrediction {
    className: string;
    probability: number;
}

interface Props {
    model?: TeachableMobileNet;
    prediction: IPrediction[];
}

const colourWheel: Colours[] = [
    'orange',
    'purple',
    'blue',
    'green',
    'red',
];

export function Preview({model, prediction}: Props) {
    const {namespace} = useVariant();
    const {t} = useTranslation(namespace);

    return <Widget dataWidget="model" title={t<string>("model.labels.title")} className={style.widget}>
        {model &&
            <div className={style.previewContainer}>
                <table className={style.table}>
                    <tbody>
                        {prediction.map((p, ix) => <tr key={ix}>
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
            <div className={style.buttonContainer}>
                <Alert severity="info">{t("model.labels.mustTrain")}</Alert>
            </div>
        }
    </Widget>
}
