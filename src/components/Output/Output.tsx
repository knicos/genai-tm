import React from "react";
import { Widget } from "../widget/Widget";
import { useTranslation } from "react-i18next";
import style from "./Output.module.css";
import { BehaviourType } from "../Behaviours/Behaviours";

interface Props {
    predicted: number;
    behaviours: BehaviourType[];
}

export default function Output({predicted, behaviours}: Props) {
    const {t} = useTranslation();

    const behaviour = (predicted >= 0 && predicted < behaviours.length) ? behaviours[predicted] : null;

    return <Widget title={t<string>("output.labels.title")} className={style.widget}>
        <div className={style.container}>
            {behaviour && <img src={behaviour.image.uri} alt="" />}
        </div>
    </Widget>;
}