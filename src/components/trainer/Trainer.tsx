import React, { useEffect, useState } from "react";
import * as tf from '@tensorflow/tfjs';
import * as tmImage from '@teachablemachine/image';
import Accordion from '@mui/material/Accordion';
import { useRecoilState, useRecoilValue } from "recoil";
import { IClassification, tfModel, stateClassifications } from "../../state";
import { Button } from "../button/Button";
import { Widget } from "../widget/Widget";
import style from "./trainer.module.css";
import { AccordionDetails, AccordionSummary, LinearProgress } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface Props {
    data: IClassification[];
    model?: tmImage.TeachableMobileNet;
    setModel: (model: tmImage.TeachableMobileNet) => void;
}

type TrainingStage = 'ready' | 'loading' | 'prepare' | 'training' | 'done';

export function Trainer({data, model, setModel}: Props) {
    const [training, setTraining] = useState(false);
    const [trainingStage, setTrainingStage] = useState('done');
    const [epochs, setEpochs] = useState(0);

    const sampleMin = Math.min(...data.map((v) => v.samples.length));
    const isTrainable = data.length >= 2 && sampleMin >= 2;

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

        setTrainingStage('examples');
        for (let ix = 0; ix < training.length; ++ix) {
            const {label, samples} = training[ix];
            console.log('Adding class', ix, label);
            await Promise.all(samples.map((s) => ((s) ? tm.addExample(ix, s) : null)));
        }
        console.log('Samples added');

        setTrainingStage('training');
        await tm.train({
            denseUnits: 100,
            epochs: 50,
            learningRate: 0.001,
            batchSize: 16,
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
        if (training) startTraining(data);
    }, [training]);

    useEffect(() => {
        return () => {
            if (model) model.dispose();
        }
    }, []);

    return <Widget title="Training">
        <div className={style.buttonContainer}>
            <Button variant="contained" size="large" disabled={training} onClick={() => {
                setTraining(true);
            }}>Train model</Button>
        </div>

        {training && <div className={style.statusContainer}>
            {trainingStage === 'loading' && <span>Loading model</span>}
            {trainingStage === 'examples' && <span>Prepairing examples...</span>}
            {trainingStage === 'training' && <div>
                <span>Training the model</span>
                <LinearProgress value={epochs * 100} variant="determinate" />
            </div>}
            {trainingStage === 'done' && <span>Training complete.</span>}
        </div>}

        <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                Advanced
            </AccordionSummary>
            <AccordionDetails>

            </AccordionDetails>
        </Accordion>
    </Widget>;
}
