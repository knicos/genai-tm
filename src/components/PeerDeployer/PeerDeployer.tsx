import { TeachableMobileNet } from '@teachablemachine/image';
import React, { useRef, useEffect, useCallback } from 'react';
import { BehaviourType } from '../Behaviour/Behaviour';
import { generateBlob, ModelContents } from '../ImageWorkspace/saver';
import { useRecoilState, useRecoilValue } from 'recoil';
import { sessionCode, sessionPassword, sharingActive } from '../../state';
import { Peer } from 'peerjs';
import randomId from '../../util/randomId';

type ProjectKind = 'image';

export interface DeployEvent {
    event: 'request' | 'project' | 'model';
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

interface Props {
    model?: TeachableMobileNet;
    behaviours?: BehaviourType[];
}

export default function PeerDeployer({ model, behaviours }: Props) {
    const [code, setCode] = useRecoilState(sessionCode);
    const pwd = useRecoilValue(sessionPassword);
    const [, setSharing] = useRecoilState(sharingActive);
    const channelRef = useRef<Peer>();
    const cache = useRef<Props>({ model, behaviours });
    const blob = useRef<ModelContents | null>(null);

    useEffect(() => {
        if (channelRef.current) {
            channelRef.current.destroy();
            channelRef.current = undefined;
        }
    }, [code]);

    const getChannel = useCallback(() => {
        if (channelRef.current !== undefined) return channelRef.current;

        const peer = new Peer(code, {
            host: process.env.REACT_APP_PEER_SERVER,
            secure: process.env.REACT_APP_PEER_SECURE === '1',
            key: process.env.REACT_APP_PEER_KEY || 'peerjs',
            port: process.env.REACT_APP_PEER_PORT ? parseInt(process.env.REACT_APP_PEER_PORT) : 443,
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
                    break;
                case 'server-error':
                    setTimeout(() => peer.reconnect(), 5000);
                    break;
                case 'unavailable-id':
                    setCode(randomId(8));
                    peer.destroy();
                    channelRef.current = undefined;
                    break;
                case 'browser-incompatible':
                    break;
                default:
                    peer.destroy();
                    channelRef.current = undefined;
            }
        });
        return channelRef.current;
    }, [code, setCode, setSharing, pwd]);

    useEffect(() => {
        getChannel();
        blob.current = null;
        cache.current.model = model;
        cache.current.behaviours = behaviours;
    }, [model, behaviours, getChannel]);

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
