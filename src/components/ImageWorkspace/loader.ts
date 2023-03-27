import JSZip from "jszip";
import * as tf from '@tensorflow/tfjs';
import * as tmImage from '@teachablemachine/image';
import { BehaviourType } from "../Behaviour/Behaviour";
import { IClassification } from "../../state";

interface ProjectTemp {
    modelJson?: string;
    modelWeights?: ArrayBuffer;
    metadata?: string;
    behaviours?: string;
    samples: string[][];
}

interface Project {
    model?: tmImage.TeachableMobileNet;
    behaviours?: BehaviourType[];
    samples?: IClassification[];
}

export async function loadProject(file: File): Promise<Project> {
    const project: ProjectTemp = {
        samples: [],
    };

    const zip = await JSZip.loadAsync(file);
    const promises: Promise<void>[] = [];

    zip.forEach((path: string, data: JSZip.JSZipObject) => {
        if (data.name === "model.json") {
            promises.push(data.async("string").then((r) => {project.modelJson = r;}));
        } else if (data.name === "weights.bin") {
            promises.push(data.async("arraybuffer").then((r) => {project.modelWeights = r;}));
        } else if (data.name === "behaviours.json") {
            promises.push(data.async("string").then((r) => {project.behaviours = r;}));
        } else if (data.name === "metadata.json") {
            promises.push(data.async("string").then((r) => {project.metadata = r;}));
        } else {
            const parts = data.name.split("/");
            if (parts.length === 2 && !!parts[1] && parts[0] === "samples") {
                const split1 = parts[1].split(".");
                if (split1.length === 2) {
                const split2 = split1[0].split("_");
                if (split2.length === 2) {
                    const ix1 = parseInt(split2[0]);
                    const ix2 = parseInt(split2[1]);
                    while (project.samples.length <= ix1) project.samples.push([]);
                    while (project.samples[ix1].length <= ix2) project.samples[ix1].push("");
                    promises.push(data.async("base64").then((r) => {project.samples[ix1][ix2] = `data:image/png;base64,${r}`}))
                }
                }
            }
        }
    });

    await Promise.all(promises);

    if (project.metadata && project.modelJson && project.modelWeights) {
        const model = await tmImage.createTeachable(JSON.parse(project.metadata), {

        });
        
        const parsedModel = JSON.parse(project.modelJson) as tf.io.ModelJSON;

        model.model = await tf.loadLayersModel({
            load: async () => {
                return {
                    modelTopology: parsedModel.modelTopology,
                    weightData: project.modelWeights,
                    weightSpecs: parsedModel.weightsManifest[0].weights
                };
            }
        });

        return {
            model,
            behaviours: (project.behaviours) ? JSON.parse(project.behaviours).behaviours : [],
            samples: (project.samples.length > 0) ? project.samples.map((sample, ix) => {
                return {
                    label: model.getLabel(ix),
                    samples: sample.map((s) => {
                        const canvas = document.createElement("canvas");
                        canvas.width = 224;
                        canvas.height = 224;
                        canvas.style.width = "58px";
                        const ctx = canvas.getContext("2d");
                        const img = new Image();
                        img.onload = (ev: Event) => {
                            ctx?.drawImage(img, 0, 0);
                        };
                        img.src = s;
                        return canvas;
                    }),
                };
            }) : undefined,
        };
    }

    return {};
}