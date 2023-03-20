import React, { useEffect, useState } from "react";
import * as tf from '@tensorflow/tfjs';
import * as tmImage from '@teachablemachine/image';
import Accordion from '@mui/material/Accordion';
import { IClassification } from "../../state";
import { Button } from "../button/Button";
import { Widget } from "../widget/Widget";
import style from "./trainer.module.css";
import { AccordionDetails, AccordionSummary, LinearProgress } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Alert from '@mui/material/Alert';
import TextField from '@mui/material/TextField';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import Tooltip, { TooltipProps, tooltipClasses } from '@mui/material/Tooltip';
import { styled } from '@mui/material/styles';
import { useTranslation } from "react-i18next";
import { useVariant } from "../../util/variant";

interface Props {
    data: IClassification[];
    model?: tmImage.TeachableMobileNet;
    setModel: (model: tmImage.TeachableMobileNet) => void;
    focus?: boolean;
    disabled?: boolean;
}

const HelpTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} enterTouchDelay={300} classes={{ popper: className }} />
  ))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: "rgba(0,0,0,0.8)",
      color: "white",
      maxWidth: 220,
      fontSize: "12pt",
      padding: "1.5rem",
    },
  }));

type TrainingStage = 'ready' | 'loading' | 'prepare' | 'training' | 'done' | 'none';

export function Trainer({data, model, setModel, ...props}: Props) {
    const {namespace, advancedMenu} = useVariant();
    const {t} = useTranslation(namespace);
    const [training, setTraining] = useState(false);
    const [trainingStage, setTrainingStage] = useState<TrainingStage>('none');
    const [epochs, setEpochs] = useState(0);
    const [settingEpochs, setSettingEpochs] = useState(50);
    const [settingRate, setSettingRate] = useState(0.001);
    const [settingBatch, setSettingBatch] = useState(16);

    const sampleMin = Math.min(...data.map((v) => v.samples.length));
    const isTrainable = data.length >= 2 && sampleMin >= 1;

    async function loadModel() {
        await tf.ready();

        try {
            const model = await tmImage.createTeachable(
				{ tfjsVersion: tf.version.tfjs },
				{ version: 2, alpha: 0.35 }
			);
            
            console.log("set loaded Model");
            return model;
        } 
        catch (err) {
            console.log(err);
            console.log("failed load model");
        }
    }

    const startTraining = async (training: IClassification[]) => {
        setTrainingStage('loading');
        setEpochs(0);
        const tm = await loadModel();

        if (!tm) {
            console.error('Could not load model');
            return;
        }

        console.log('Start training', training);
        tm.setLabels(training.map((t) => t.label));
        tm.setSeed("something");

        setTrainingStage('prepare');
        for (let ix = 0; ix < training.length; ++ix) {
            const {label, samples} = training[ix];
            console.log('Adding class', ix, label);
            await Promise.all(samples.map((s) => ((s) ? tm.addExample(ix, s) : null)));
        }
        console.log('Samples added');

        setTrainingStage('training');
        await tm.train({
            denseUnits: 100,
            epochs: settingEpochs,
            learningRate: settingRate,
            batchSize: settingBatch,
        }, {
            onEpochEnd: (epoch, logs) => {
                console.log('Epoch', epoch, logs);
                setEpochs(epoch / 50);
            },
        });
        console.log('Trained');

        if (model) model.dispose();
        setModel(tm);
        setTrainingStage('done');
        setTraining(false);
    }

    useEffect(() => {
        setTrainingStage('none');
    }, [data]);

    useEffect(() => {
        if (training) startTraining(data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [training]);

    useEffect(() => {
        return () => {
            if (model) model.dispose();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <Widget dataWidget="trainer" title={t<string>("training.labels.title")} className={style.widget} {...props}>
        <div className={style.buttonContainer}>
            <Button sx={{flexGrow: 1}} variant="contained" size="large" disabled={training || !isTrainable} onClick={() => {
                setTraining(true);
            }}>{t("training.actions.train")}</Button>
        </div>

        {<div className={style.statusContainer}>
            {trainingStage === 'none' && isTrainable && <Alert severity="warning">{t("training.labels.needsTraining")}</Alert>}
            {trainingStage === 'none' && !isTrainable && <Alert severity="info">{t("training.labels.addMore")}</Alert>}
            {trainingStage === 'loading' && <span>{t("training.labels.loading")}</span>}
            {trainingStage === 'prepare' && <span>{t("training.labels.prepairing")}</span>}
            {trainingStage === 'training' && <div>
                <span>{t("training.labels.training")}</span>
                <LinearProgress value={epochs * 100} variant="determinate" />
            </div>}
            {trainingStage === 'done' && <Alert severity="success">{t("training.labels.complete")}</Alert>}
        </div>}

        {advancedMenu && <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <span className={style.advancedTitle}>{t("training.labels.advanced")}</span>
            </AccordionSummary>
            <AccordionDetails>
                <div className={style.formfield}>
                    <span>{t("training.labels.epochs")}:</span>
                    <TextField
                        sx={{maxWidth: "6rem"}}
                        hiddenLabel
                        id="epochs"
                        variant="filled"
                        type="number"
                        size="small"
                        value={settingEpochs}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            setSettingEpochs(event.target.valueAsNumber);
                        }}
                    />
                    <HelpTooltip title={t<string>("training.tooltips.epochs")} placement="left">
                        <HelpOutlineIcon sx={{marginLeft: "auto"}} color="info" />
                    </HelpTooltip>
                </div>
                <div className={style.formfield}>
                    <span>{t("training.labels.learningRate")}:</span>
                    <TextField
                        sx={{maxWidth: "6rem"}}
                        hiddenLabel
                        id="learningrate"
                        variant="filled"
                        type="number"
                        size="small"
                        value={settingRate}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            setSettingRate(event.target.valueAsNumber);
                        }}
                    />
                    <HelpTooltip title={t<string>("training.tooltips.learningRate")} placement="left">
                        <HelpOutlineIcon sx={{marginLeft: "auto"}} color="info" />
                    </HelpTooltip>
                </div>
                <div className={style.formfield}>
                    <span>{t("training.labels.batchSize")}:</span>
                    <TextField
                        sx={{maxWidth: "6rem"}}
                        hiddenLabel
                        id="batch"
                        variant="filled"
                        type="number"
                        size="small"
                        value={settingBatch}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                            setSettingBatch(event.target.valueAsNumber);
                        }}
                    />
                    <HelpTooltip title={t<string>("training.tooltips.batchSize")} placement="left">
                        <HelpOutlineIcon sx={{marginLeft: "auto"}} color="info" />
                    </HelpTooltip>
                </div>
            </AccordionDetails>
        </Accordion>}
    </Widget>;
}
