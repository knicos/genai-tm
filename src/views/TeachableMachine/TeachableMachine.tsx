import React, { useState } from "react";
import { TeachableMobileNet } from '@teachablemachine/image';
import { TrainingData } from "../../components/trainingdata/TrainingData";
import { Trainer } from "../../components/trainer/Trainer";
import { Preview } from "../../components/preview/Preview";
import { IClassification } from "../../state";
import style from "./TeachableMachine.module.css";

export function TeachableMachine() {
    const [model, setModel] = useState<TeachableMobileNet | undefined>();
    const [data, setData] = useState<IClassification[]>([
        {
            label: 'Class 1',
            samples: []
        },
        {
            label: 'Class 2',
            samples: []
        }
    ]);

    return <div className={style.container}>
        <TrainingData data={data} setData={setData} active={true} />
        <Trainer data={data} model={model} setModel={setModel} />
        <Preview model={model} />
    </div>;
}
