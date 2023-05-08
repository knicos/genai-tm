import { TeachableMobileNet } from '@teachablemachine/image';
import React, { useRef, useEffect, useCallback, useState } from 'react';
import { BehaviourType } from '../Behaviour/Behaviour';
import { generateBlob } from '../ImageWorkspace/saver';
import { useRecoilState, useRecoilValue } from 'recoil';
import { sessionCode, sessionPassword, sharingActive } from '../../state';
import { Peer } from 'peerjs';
import randomId from '../../util/randomId';

type ProjectKind = 'image';

export interface DeployEvent {
    event: 'request' | 'project';
}

export interface DeployEventRequest extends DeployEvent {
    event: 'request';
    channel: string;
}

export interface DeployEventData extends DeployEvent {
    event: 'project';
    project: Blob;
    kind: ProjectKind;
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
    const blob = useRef<Blob | null>(null);

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
            if (conn.metadata.password !== pwd) {
                conn.close();
                return;
            }
            conn.on('data', async (data: unknown) => {
                const ev = data as DeployEventRequest;
                console.log('GOT DATA', data);
                if (ev?.event === 'request') {
                    if (blob.current === null) {
                        blob.current = await generateBlob(cache.current.model, cache.current.behaviours);
                    }
                    conn.send({ event: 'project', project: blob.current, kind: 'image' });
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
