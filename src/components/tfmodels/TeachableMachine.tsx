import React, { useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as tmImage from '@teachablemachine/image';
import { useRecoilState } from 'recoil'
import { tfModel } from '../../state';

export function TeachableMachine() {
    const [model, setModel] = useRecoilState(tfModel);

    async function loadModel() {
        try {
            const model = await tmImage.createTeachable(
				{ tfjsVersion: tf.version.tfjs },
				{ version: 2, alpha: 0.35 }
			);
            setModel(model);
            console.log("set loaded Model");
        } 
        catch (err) {
            console.log(err);
            console.log("failed load model");
        }
    }

    useEffect(() => {
        tf.ready().then(() => {
            loadModel();
        });
    }, []);
    return <></>;
}
