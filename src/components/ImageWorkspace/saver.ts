import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import tfjs from '@tensorflow/tfjs';
import { BehaviourType } from '../Behaviours/Behaviours';
import { IClassification, saveState, behaviourState, classState, sessionCode } from '../../state';
import { TeachableModel, useTeachableModel } from '../../util/TeachableModel';
import { useRecoilValue, useRecoilState } from 'recoil';
import { useEffect } from 'react';

export interface ModelContents {
    behaviours?: string;
    zip?: Blob;
    model?: string;
    metadata?: string;
    weights?: ArrayBuffer;
}

export async function generateBlob(
    code: string,
    model?: TeachableModel,
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
        contents.metadata = JSON.stringify({ ...model.getMetadata(), projectId: code });
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
    code: string,
    model?: TeachableModel,
    behaviours?: BehaviourType[],
    samples?: IClassification[]
) {
    const zipData = await generateBlob(code, model, behaviours, samples);
    if (zipData.zip) saveAs(zipData.zip, name);
}

interface Props {
    onSaved?: () => void;
}

export function ModelSaver({ onSaved }: Props) {
    const { model } = useTeachableModel();
    const behaviours = useRecoilValue(behaviourState);
    const code = useRecoilValue(sessionCode);
    const data = useRecoilValue(classState);
    const [saving, setSaving] = useRecoilState(saveState);

    useEffect(() => {
        if (saving) {
            model?.setName(saving.name);
            saveProject(
                `${saving.name}.zip`,
                code,
                model,
                saving.behaviours ? behaviours : undefined,
                saving.samples ? data : undefined
            ).then(() => {
                setSaving(null);
                if (onSaved) onSaved();
            });
        }
    }, [saving, code, data, behaviours, model, onSaved, setSaving]);

    return null;
}
