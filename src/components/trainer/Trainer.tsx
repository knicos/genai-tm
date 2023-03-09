import React, { useEffect } from "react";
import * as tf from '@tensorflow/tfjs';
import * as tmImage from '@teachablemachine/image';
import Accordion from '@mui/material/Accordion';
import { useRecoilState, useRecoilValue } from "recoil";
import { IClassification, tfModel, stateClassifications } from "../../state";
import { Button } from "../button/Button";
import { Widget } from "../widget/Widget";
import style from "./trainer.module.css";
import { AccordionDetails, AccordionSummary } from "@mui/material";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface Props {
    data: IClassification[];
    model?: tmImage.TeachableMobileNet;
    setModel: (model: tmImage.TeachableMobileNet) => void;
}

export function Trainer({data, model, setModel}: Props) {
    const training = data;

    const sampleMin = Math.min(...training.map((v) => v.samples.length));
    const isTrainable = training.length >= 2 && sampleMin >= 2;

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
        const tm = await loadModel();

        if (!tm) {
            console.error('Could not load model');
            return;
        }

        console.log('Start training', training);
        tm.setLabels(training.map((t) => t.label));
        tm.setSeed("something");
        for (let ix = 0; ix < training.length; ++ix) {
            const {label, samples} = training[ix];
            console.log('Adding class', ix, label);
            await Promise.all(samples.map((s) => ((s) ? tm.addExample(ix, s) : null)));
        }
        console.log('Samples added');

        await tm.train({
            denseUnits: 100,
            epochs: 50,
            learningRate: 0.001,
            batchSize: 16,
        }, {
            onEpochEnd: (epoch, logs) => {
                console.log('Epoch', epoch, logs);
            },
        });
        console.log('Trained');

        if (model) model.dispose();
        setModel(tm);
    }

    useEffect(() => {
        return () => {
            if (model) model.dispose();
        }
    }, []);

    return <Widget title="Training">
        <div className={style.buttonContainer}>
            <Button variant="contained" size="large" disabled={false} onClick={() => {
                startTraining(data);
            }}>Train model</Button>
        </div>
        <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                Advanced
            </AccordionSummary>
            <AccordionDetails>

            </AccordionDetails>
        </Accordion>
    </Widget>;
}
