import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import tfjs from '@tensorflow/tfjs';
import { BehaviourType } from '../Behaviours/Behaviours';
import { TeachableMobileNet } from '@teachablemachine/image';
import { IClassification } from '../../state';

export interface ModelContents {
    behaviours?: string;
    zip?: Blob;
    model?: string;
    metadata?: string;
    weights?: ArrayBuffer;
}

export async function generateBlob(
    model?: TeachableMobileNet,
    behaviours?: BehaviourType[],
    samples?: IClassification[]
): Promise<ModelContents> {
    const zip = new JSZip();
    if (samples) {
        const folder = zip.folder('samples');
        if (folder) {
            for (let j = 0; j < samples.length; ++j) {
                const s = samples[j];
                for (let i = 0; i < s.samples.length; ++i) {
                    const ss = s.samples[i];
                    folder.file(`${j}_${i}.png`, ss.toDataURL('image/png').split(';base64,')[1], { base64: true });
                }
            }
        }
    }

    const contents: ModelContents = {};

    if (behaviours) {
        contents.behaviours = JSON.stringify({
            behaviours,
            version: 1,
        });
        zip.file('behaviours.json', contents.behaviours);
    }

    let zipData: Blob = new Blob();
    if (model) {
        contents.metadata = JSON.stringify(model.getMetadata());
        zip.file('metadata.json', contents.metadata);

        await model.save({
            save: async (artifact: tfjs.io.ModelArtifacts) => {
                if (artifact.weightData) {
                    contents.weights = artifact.weightData;
                    zip.file('weights.bin', artifact.weightData);
                }
                if (typeof artifact.modelTopology) {
                    contents.model = JSON.stringify({
                        modelTopology: artifact.modelTopology,
                        weightsManifest: [{ paths: ['./weights.bin'], weights: artifact.weightSpecs }],
                    });
                    zip.file('model.json', contents.model);
                }

                zipData = await zip.generateAsync({ type: 'blob' });
                return {
                    modelArtifactsInfo: {
                        dateSaved: new Date(),
                        modelTopologyType: 'JSON',
                    },
                } as tfjs.io.SaveResult;
            },
        });
    } else {
        console.warn('No model to save');
    }

    contents.zip = zipData;
    return contents;
}

export async function saveProject(
    name: string,
    model?: TeachableMobileNet,
    behaviours?: BehaviourType[],
    samples?: IClassification[]
) {
    const zipData = await generateBlob(model, behaviours, samples);
    if (zipData.zip) saveAs(zipData.zip, name);
}
