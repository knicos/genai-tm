import React, { useRef, useEffect, useCallback } from 'react';
import { BehaviourType } from '../Behaviour/Behaviour';
import { generateBlob, ModelContents } from '../ImageWorkspace/saver';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
    behaviourState,
    classState,
    sessionCode,
    sessionPassword,
    sharingActive,
    iceConfig,
    //p2pActive,
} from '../../state';
import { Peer } from 'peerjs';
import randomId from '../../util/randomId';
import { TeachableModel, useTeachableModel } from '../../util/TeachableModel';
import { createAnalysis, createModelStats } from './analysis';
import { canvasFromURL } from '../../util/canvas';

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
}

export default function PeerDeployer() {
    const [code, setCode] = useRecoilState(sessionCode);
    const pwd = useRecoilValue(sessionPassword);
    const [, setSharing] = useRecoilState(sharingActive);
    const [classes, setClassData] = useRecoilState(classState);
    const channelRef = useRef<Peer>();
    const { model } = useTeachableModel();
    const behaviours = useRecoilValue(behaviourState);
    //const enableP2P = useRecoilValue(p2pActive);
    const cache = useRef<CacheState>({ model, behaviours });
    const blob = useRef<ModelContents | null>(null);
    const ice = useRecoilValue(iceConfig);

    useEffect(() => {
        if (channelRef.current) {
            channelRef.current.destroy();
            channelRef.current = undefined;
        }
    }, [code]);

    const getChannel = useCallback(() => {
        if (channelRef.current !== undefined) return channelRef.current;

        if (!ice) return;

        const peer = new Peer(code, {
            host: process.env.REACT_APP_PEER_SERVER,
            secure: process.env.REACT_APP_PEER_SECURE === '1',
            key: process.env.REACT_APP_PEER_KEY || 'peerjs',
            port: process.env.REACT_APP_PEER_PORT ? parseInt(process.env.REACT_APP_PEER_PORT) : 443,
            config: { iceServers: ice.iceServers, sdpSemantics: 'unified-plan' },
        });
        channelRef.current = peer;
        peer.on('open', (id: string) => {
            setSharing(true);
        });
        peer.on('close', () => {
            setSharing(false);
        });
        peer.on('connection', (conn) => {
            conn.on('data', async (data: unknown) => {
                const ev = data as DeployEventRequest;
                if (ev?.event === 'request') {
                    if (blob.current === null) {
                        blob.current = await generateBlob(code, cache.current.model, cache.current.behaviours);
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
                            if (ev?.password !== pwd) {
                                conn.close();
                                return;
                            }
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
                    setClassData((old) => {
                        let newData = [...old];
                        if (newData.length > sev.index) {
                            newData[sev.index] = {
                                samples: [{ data: newImage, id: sev.id }, ...newData[sev.index].samples],
                                label: old[sev.index].label,
                            };
                            conn.send({ event: 'sample_state', state: 'added', id: sev.id });
                        }
                        return newData;
                    });
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
            });
            conn.on('error', (err: Error) => {
                console.error('Peer connection error', err);
            });
        });

        peer.on('error', (err: any) => {
            const type: string = err.type;
            console.error('Peer', type, err);
            switch (type) {
                case 'disconnected':
                case 'network':
                    setTimeout(() => peer.reconnect(), 1000);
                    setSharing(false);
                    break;
                case 'server-error':
                    setTimeout(() => peer.reconnect(), 5000);
                    setSharing(false);
                    break;
                case 'unavailable-id':
                    setCode(randomId(8));
                    peer.destroy();
                    channelRef.current = undefined;
                    break;
                case 'browser-incompatible':
                    setSharing(false);
                    console.error('Your browser does not support WebRTC');
                    break;
                default:
                    peer.destroy();
                    setSharing(false);
                    channelRef.current = undefined;
            }
        });
        return channelRef.current;
    }, [code, setCode, setSharing, pwd, setClassData, ice]);

    useEffect(() => {
        getChannel();
        blob.current = null;
        cache.current.model = model;
        cache.current.behaviours = behaviours;
        cache.current.predictions = undefined;
        cache.current.reference = undefined;
    }, [model, behaviours, getChannel]);

    useEffect(() => {
        cache.current.classNames = classes.map((c) => c.label);
        cache.current.samples = classes.map((c) => c.samples.map((s) => s.id));
    }, [classes]);

    useEffect(() => {
        return () => {
            if (channelRef.current) {
                channelRef.current.destroy();
                channelRef.current = undefined;
            }
        };
    }, []);

    return null;
}
