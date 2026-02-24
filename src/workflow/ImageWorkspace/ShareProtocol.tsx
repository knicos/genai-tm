import ClassifierApp, { TeachableModel } from '@genai-fi/classifier';
import { useCallback, useEffect, useRef } from 'react';
import { BehaviourType } from '../Behaviour/Behaviour';
import {
    behaviourState,
    classState,
    IClassification,
    modelShared,
    sessionCode,
    shareModel,
    shareSamples,
} from '@genaitm/state';
import { useTeachableModel } from '@genaitm/util/TeachableModel';
import { useAtomValue, useSetAtom } from 'jotai';

interface CacheState {
    model?: TeachableModel;
    behaviours?: BehaviourType[];
    rawSamples?: IClassification[];
    code: string;
}

async function sendModel(
    code: string,
    model: TeachableModel,
    behaviours: BehaviourType[],
    samples?: IClassification[]
) {
    const app = new ClassifierApp(
        model.getVariant(),
        model,
        behaviours,
        samples?.map((s) => s.samples)
    );
    app.projectId = code;
    const blob = await app.saveComponents();
    if (!blob.zip) return;
    const response = await fetch(`${import.meta.env.VITE_APP_API || 'http://localhost:9001'}/model/${code}/`, {
        method: 'POST',
        body: blob.zip,
    });
    if (!response.ok) {
        throw new Error(`Failed to upload model: ${response.statusText}`);
    }
}

export default function ShareProtocol() {
    const includeSamples = useAtomValue(shareSamples);
    const classes = useAtomValue(classState);
    const code = useAtomValue(sessionCode);
    const { model } = useTeachableModel();
    const behaviours = useAtomValue(behaviourState);
    const cache = useRef<CacheState>({ model, behaviours, code });
    const share = useAtomValue(shareModel);
    const setModelShared = useSetAtom(modelShared);

    cache.current.model = model;
    cache.current.behaviours = behaviours;
    cache.current.rawSamples = includeSamples ? classes : undefined;
    cache.current.code = code;

    const send = useCallback(() => {
        const model = cache.current.model;
        const behaviours = cache.current.behaviours || [];
        const classes = cache.current.rawSamples;
        const code = cache.current.code;

        if (model) {
            setModelShared(false);
            sendModel(code, model, behaviours, classes)
                .then(() => {
                    setModelShared(true);
                })
                .catch((err) => {
                    console.error('Failed to share model', err);
                    setModelShared(false);
                });
        }
    }, [setModelShared]);

    useEffect(() => {
        if (share && model) {
            const timer = setInterval(send, 20 * 60 * 1000); // every 20 minutes
            send();
            return () => clearInterval(timer);
        } else if (!share && model) {
            fetch(`${import.meta.env.VITE_APP_API || 'http://localhost:9001'}/model/${cache.current.code}/`, {
                method: 'DELETE',
            }).catch((err) => {
                // Silently handle connection errors when collaboration server isn't running
                if (err instanceof TypeError && err.message?.includes('Failed to fetch')) {
                    // Collaboration server not available - this is expected when not using P2P features
                    console.debug('Collaboration server not available');
                } else {
                    console.error('Failed to unshare model', err);
                }
            });
            setModelShared(false);
        }
    }, [share, model, send]);

    return null;
}
