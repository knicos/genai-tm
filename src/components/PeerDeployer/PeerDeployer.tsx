import { useRef, useEffect, useCallback } from 'react';
import { BehaviourType } from '../Behaviour/Behaviour';
import { generateBlob, ModelContents } from '../ImageWorkspace/saver';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import {
    behaviourState,
    classState,
    sessionCode,
    sharingActive,
    shareSamples,
    IClassification,
    inputImage,
    //p2pActive,
} from '../../state';
import { TeachableModel, useTeachableModel } from '../../util/TeachableModel';
import { createAnalysis, createModelStats } from './analysis';
import { canvasFromURL, ConnectionMonitor, usePeer } from '@knicos/genai-base';
import { DataConnection } from 'peerjs';

type ProjectKind = 'image';

export interface DeployEvent {
    event: 'request' | 'project' | 'model' | 'add_sample' | 'request_class' | 'delete_sample';
}

export interface AddSampleEvent extends DeployEvent {
    event: 'add_sample';
    data: string;
    index: number;
    id: string;
}

export interface DeleteSampleEvent extends DeployEvent {
    event: 'delete_sample';
    index: number;
    id: string;
}

export interface RequestClassEvent extends DeployEvent {
    event: 'request_class';
}

export interface DeployEventRequest extends DeployEvent {
    event: 'request';
    channel?: string;
    entity?: 'model' | 'metadata' | 'project' | 'weights';
    password?: string;
}

export interface DeployEventData extends DeployEvent {
    event: 'project';
    project: Blob;
    kind: ProjectKind;
}

export interface ModelEventData extends DeployEvent {
    event: 'model';
    component: 'model' | 'metadata' | 'weights';
    data: Blob;
}

interface CacheState {
    model?: TeachableModel;
    behaviours?: BehaviourType[];
    reference?: number[];
    predictions?: number[];
    classNames?: string[];
    samples?: string[][];
    rawSamples?: IClassification[];
}

export default function PeerDeployer() {
    const [code] = useRecoilState(sessionCode);
    const includeSamples = useRecoilValue(shareSamples);
    const [, setSharing] = useRecoilState(sharingActive);
    const [classes, setClassData] = useRecoilState(classState);
    const { model } = useTeachableModel();
    const behaviours = useRecoilValue(behaviourState);
    //const enableP2P = useRecoilValue(p2pActive);
    const cache = useRef<CacheState>({ model, behaviours });
    const blob = useRef<ModelContents | null>(null);
    const setInput = useSetRecoilState(inputImage);

    const dataHandler = useCallback(async (data: unknown, conn: DataConnection) => {
        const ev = data as DeployEventRequest;
        if (ev?.event === 'request') {
            if (blob.current === null) {
                blob.current = await generateBlob(
                    code,
                    cache.current.model,
                    cache.current.behaviours,
                    cache.current?.rawSamples ? cache.current.rawSamples : undefined
                );
            }
            switch (ev.entity || 'project') {
                case 'metadata':
                    conn.send({ event: 'model', component: 'metadata', data: blob.current.metadata });
                    break;
                case 'model':
                    conn.send({ event: 'model', component: 'model', data: blob.current.model });
                    break;
                case 'weights':
                    conn.send({ event: 'model', component: 'weights', data: blob.current.weights });
                    break;
                case 'project':
                    conn.send({ event: 'project', project: blob.current.zip, kind: 'image' });
                    break;
            }
        } else if (ev?.event === 'request_class') {
            if (cache.current.classNames) {
                conn.send({ event: 'class', labels: cache.current.classNames, samples: cache.current.samples });
            }
        } else if (ev?.event === 'add_sample') {
            const sev = data as AddSampleEvent;
            const newImage = await canvasFromURL(sev.data);
            if (sev.index === -1) {
                setInput(newImage);
            } else {
                setClassData((old) => {
                    const newData = [...old];
                    if (newData.length > sev.index) {
                        newData[sev.index] = {
                            samples: [{ data: newImage, id: sev.id }, ...newData[sev.index].samples],
                            label: old[sev.index].label,
                        };
                        conn.send({ event: 'sample_state', state: 'added', id: sev.id });
                    }
                    return newData;
                });
            }
        } else if (ev?.event === 'delete_sample') {
            const sev = data as DeleteSampleEvent;
            setClassData((old) => {
                if (old.length > sev.index) {
                    const newData = [...old];
                    newData[sev.index] = {
                        label: old[sev.index].label,
                        samples: old[sev.index].samples.filter((s) => s.id !== sev.id),
                    };
                    conn.send({ event: 'sample_state', state: 'deleted', id: sev.id });
                    return newData;
                }
                return old;
            });
        } else if (ev?.event === 'analyse') {
            if (cache.current?.model) {
                if (cache.current.reference === undefined || cache.current.predictions === undefined) {
                    const { reference, predictions } = await cache.current.model.calculateAccuracy();
                    const cvtReference = (await reference.array()) as number[];
                    const cvtPredictions = (await predictions.array()) as number[];
                    cache.current.reference = cvtReference;
                    cache.current.predictions = cvtPredictions;
                }
                conn.send({
                    event: 'analysis',
                    ...createAnalysis(
                        cache.current.model.getLabels(),
                        cache.current.reference,
                        cache.current.predictions
                    ),
                    ...createModelStats(cache.current.model),
                });
            }
        }
    }, []);

    const { ready, status, error } = usePeer({
        host: import.meta.env.VITE_APP_PEER_SERVER,
        secure: import.meta.env.VITE_APP_PEER_SECURE === '1',
        key: import.meta.env.VITE_APP_PEER_KEY || 'peerjs',
        port: import.meta.env.VITE_APP_PEER_PORT ? parseInt(import.meta.env.VITE_APP_PEER_PORT) : 443,
        code: `tm-${code}`,
        onData: dataHandler,
        onClose: () => {},
    });

    useEffect(() => {
        setSharing(ready);
    }, [ready]);

    useEffect(() => {
        blob.current = null;
        cache.current.model = model;
        cache.current.behaviours = behaviours;
        cache.current.predictions = undefined;
        cache.current.reference = undefined;
    }, [model, behaviours]);

    useEffect(() => {
        // Reset the blob data if samples are included or excluded.
        if ((cache.current.rawSamples && !includeSamples) || (!cache.current.rawSamples && includeSamples)) {
            blob.current = null;
        }
        cache.current.rawSamples = includeSamples ? classes : undefined;
        cache.current.classNames = classes.map((c) => c.label);
        cache.current.samples = classes.map((c) => c.samples.map((s) => s.id));
    }, [classes, includeSamples]);

    return (
        <ConnectionMonitor
            api={import.meta.env.VITE_APP_APIURL}
            appName="tm"
            ready={ready}
            status={status}
            error={error}
        />
    );
}
