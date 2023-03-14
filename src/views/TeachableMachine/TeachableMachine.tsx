import React, { useState } from "react";
import { TeachableMobileNet } from '@teachablemachine/image';
import { TrainingData } from "../../components/trainingdata/TrainingData";
import { Trainer } from "../../components/trainer/Trainer";
import { Preview } from "../../components/preview/Preview";
import { IClassification } from "../../state";
import style from "./TeachableMachine.module.css";
import { useTranslation } from "react-i18next";
import Output from "../../components/Output/Output";
import Behaviours, { BehaviourType } from "../../components/Behaviours/Behaviours";

export function TeachableMachine() {
    const {t} = useTranslation();
    const [behaviours, setBehaviours] = useState<BehaviourType[]>([]);
    const [pred, setPred] = useState(-1);
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
        <Preview model={model} onPrediction={setPred}/>
        <Output predicted={pred} behaviours={behaviours} />
        <Behaviours classes={model?.getLabels() || []} behaviours={behaviours} setBehaviours={setBehaviours}/>
    </div>;
}
