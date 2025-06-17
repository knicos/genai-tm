import { usePeerData } from '@genai-fi/base/hooks/peer';
import { EventProtocol } from './events';
import { Connection } from '@genai-fi/base';
import ClassifierApp, { TeachableModel } from '@genai-fi/classifier';
import { useEffect, useRef } from 'react';
import { BehaviourType } from '../../workflow/Behaviour/Behaviour';
import { behaviourState, classState, IClassification, sessionCode, shareSamples } from '@genaitm/state';
import { useTeachableModel } from '@genaitm/util/TeachableModel';
import { useAtom, useAtomValue } from 'jotai';

interface CacheState {
    model?: TeachableModel;
    behaviours?: BehaviourType[];
    rawSamples?: IClassification[];
}

export default function ShareProtocol() {
    const includeSamples = useAtomValue(shareSamples);
    const [classes] = useAtom(classState);
    const code = useAtomValue(sessionCode);
    const { model } = useTeachableModel();
    const behaviours = useAtomValue(behaviourState);
    const cache = useRef<CacheState>({ model, behaviours });
    const blob = useRef<Blob | undefined>(undefined);

    cache.current.model = model;
    cache.current.behaviours = behaviours;

    usePeerData(async (data: EventProtocol, conn: Connection<EventProtocol>) => {
        if (data.event === 'request') {
            console.log('ShareProtocol: Request for project', code, data);
            if (blob.current === undefined && cache.current.model) {
                const app = new ClassifierApp(
                    cache.current.model.getVariant(),
                    model,
                    behaviours,
                    cache.current.rawSamples?.map((s) => s.samples)
                );
                app.projectId = code;
                blob.current = await app.save();
                app.model?.dispose();
            }
            // FIXME: Get the individual components as blobs.
            switch (data.entity || 'project') {
                /*case 'metadata':
                        conn.send({ event: 'model', component: 'metadata', data: blob.current.metadata });
                        break;
                    case 'model':
                        conn.send({ event: 'model', component: 'model', data: blob.current.model });
                        break;
                    case 'weights':
                        conn.send({ event: 'model', component: 'weights', data: blob.current.weights });
                        break;*/
                case 'project':
                    console.log('ShareProtocol: Sending project blob', code);
                    conn.send({ event: 'project', project: blob.current, kind: 'image' });
                    break;
            }
        }
    });

    useEffect(() => {
        // Reset the blob data if samples are included or excluded.
        if ((cache.current.rawSamples && !includeSamples) || (!cache.current.rawSamples && includeSamples)) {
            blob.current = undefined;
        }
        cache.current.rawSamples = includeSamples ? classes : undefined;
    }, [classes, includeSamples]);

    return null;
}
