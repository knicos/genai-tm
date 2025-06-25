import { usePeerData } from '@genai-fi/base/hooks/peer';
import { EventProtocol } from './events';
import { Connection } from '@genai-fi/base';
import ClassifierApp, { TeachableModel } from '@genai-fi/classifier';
import { useEffect, useRef } from 'react';
import { BehaviourType } from '../../workflow/Behaviour/Behaviour';
import { behaviourState, classState, IClassification, sessionCode, shareSamples } from '@genaitm/state';
import { useTeachableModel } from '@genaitm/util/TeachableModel';
import { useAtomValue } from 'jotai';
import { ModelContents } from '@genaitm/workflow/ImageWorkspace/saver';

interface CacheState {
    model?: TeachableModel;
    behaviours?: BehaviourType[];
    rawSamples?: IClassification[];
}

export default function ShareProtocol() {
    const includeSamples = useAtomValue(shareSamples);
    const classes = useAtomValue(classState);
    const code = useAtomValue(sessionCode);
    const { model } = useTeachableModel();
    const behaviours = useAtomValue(behaviourState);
    const cache = useRef<CacheState>({ model, behaviours });
    const blob = useRef<ModelContents | undefined>(undefined);

    cache.current.model = model;
    cache.current.behaviours = behaviours;
    cache.current.rawSamples = includeSamples ? classes : undefined;

    usePeerData(async (data: EventProtocol, conn: Connection<EventProtocol>) => {
        if (data.event === 'request') {
            if (blob.current === undefined && cache.current.model) {
                const app = new ClassifierApp(
                    cache.current.model.getVariant(),
                    model,
                    behaviours,
                    cache.current.rawSamples?.map((s) => s.samples)
                );
                app.projectId = code;
                blob.current = await app.saveComponents();
            }

            switch (data.entity || 'project') {
                case 'metadata':
                    conn.send({ event: 'model', component: 'metadata', data: blob.current?.metadata });
                    break;
                case 'model':
                    conn.send({ event: 'model', component: 'model', data: blob.current?.model });
                    break;
                case 'weights':
                    conn.send({ event: 'model', component: 'weights', data: blob.current?.weights });
                    break;
                case 'project':
                    conn.send({ event: 'project', project: blob.current?.zip, kind: 'image' });
                    break;
            }
        }
    });

    // Reset the blob cache
    useEffect(() => {
        blob.current = undefined;
    }, [classes, includeSamples, behaviours, model, code]);

    return null;
}
