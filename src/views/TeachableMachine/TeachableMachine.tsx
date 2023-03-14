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
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import IconButton from "@mui/material/IconButton";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

export function TeachableMachine() {
    const {t} = useTranslation();
    const [step, setStep] = useState(0);
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

    return <>
        <div className={style.workspace}>
            <div className={style.container}>
                <TrainingData disabled={step > 0} data={data} setData={setData} active={true} />
                <Trainer disabled={step > 0} focus={step === 0} data={data} model={model} setModel={setModel} />
                <Preview model={model} onPrediction={setPred}/>
                {step > 0 && <Output focus={step === 1} predicted={pred} behaviours={behaviours} />}
                {step > 0 && <Behaviours classes={model?.getLabels() || []} behaviours={behaviours} setBehaviours={setBehaviours}/>}
            </div>
        </div>
        <div className={style.fixed}>
            <IconButton disabled={step <= 0} size="large" onClick={() => setStep(step - 1)}>
                <ArrowBackIosIcon fontSize="large" />
            </IconButton>
            <Stepper activeStep={step} >
                <Step>
                    <StepLabel>Create your model</StepLabel>
                </Step>
                <Step disabled={!model}>
                    <StepLabel>Deploy the model</StepLabel>
                </Step>
            </Stepper>
            <IconButton disabled={step >= 1 || !model} size="large" onClick={() => setStep(step + 1)}>
                <ArrowForwardIosIcon fontSize="large"/>
            </IconButton>
        </div>
    </>;
}
