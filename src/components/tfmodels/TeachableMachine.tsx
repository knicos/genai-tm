import React, { useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as tmImage from '@teachablemachine/image';
import { useRecoilState, useRecoilValue } from 'recoil'
import { IClassification, tfModel, trainingData } from '../../state';

export function TeachableMachine() {
    const [model, setModel] = useRecoilState(tfModel);
    const training = useRecoilValue(trainingData);

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

    async function startTraining(training: IClassification[]) {
        const tm = await loadModel();

        if (!tm) {
            console.error('Could not load model');
            return;
        }

        console.log('Start training', tm);
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

        setModel((old) => {
            if (old && old.isTrained) old.dispose();
            console.log('Setting model');
            return tm;
        });
    }

    useEffect(() => {
        if (training?.length > 0) {
            startTraining(training);
        }
    }, [training]);

    useEffect(() => {
        return () => {
            if (model) model.dispose();
        }
    }, []);
    return <></>;
}
