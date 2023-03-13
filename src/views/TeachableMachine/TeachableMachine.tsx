import React, { useState } from "react";
import { TeachableMobileNet } from '@teachablemachine/image';
import { TrainingData } from "../../components/trainingdata/TrainingData";
import { Trainer } from "../../components/trainer/Trainer";
import { Preview } from "../../components/preview/Preview";
import { IClassification } from "../../state";
import style from "./TeachableMachine.module.css";
import { useTranslation } from "react-i18next";

export function TeachableMachine() {
    const {t} = useTranslation();
    const [model, setModel] = useState<TeachableMobileNet | undefined>();
    const [data, setData] = useState<IClassification[]>([
        {
            label: `${t("trainingdata.labels.class")} 1`,
            samples: []
        },
        {
            label: `${t("trainingdata.labels.class")} 2`,
            samples: []
        }
    ]);

    return <div className={style.container}>
        <TrainingData data={data} setData={setData} active={true} />
        <Trainer data={data} model={model} setModel={setModel} />
        <Preview model={model} />
    </div>;
}
