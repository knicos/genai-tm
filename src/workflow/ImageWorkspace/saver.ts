import { saveAs } from 'file-saver';
import { BehaviourType } from '../../workflow/Behaviours/Behaviours';
import { IClassification, saveState, behaviourState, classState, sessionCode } from '../../state';
import { useTeachableModel } from '../../util/TeachableModel';
import { useAtomValue, useAtom } from 'jotai';
import { useEffect } from 'react';
import ClassifierApp, { TeachableModel } from '@genai-fi/classifier';

export interface ModelContents {
    behaviours?: string;
    zip?: Blob;
    model?: string;
    metadata?: string;
    weights?: ArrayBuffer;
}

export async function saveProject(
    name: string,
    code: string,
    model?: TeachableModel,
    behaviours?: BehaviourType[],
    samples?: IClassification[]
) {
    if (model) {
        const app = new ClassifierApp(
            model.getVariant(),
            model,
            behaviours,
            samples?.map((s) => s.samples)
        );
        app.projectId = code;
        const zipData = await app.save();
        if (zipData) saveAs(zipData, name);
    }
}

interface Props {
    onSaved?: () => void;
}

export function ModelSaver({ onSaved }: Props) {
    const { model } = useTeachableModel();
    const behaviours = useAtomValue(behaviourState);
    const code = useAtomValue(sessionCode);
    const data = useAtomValue(classState);
    const [saving, setSaving] = useAtom(saveState);

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
