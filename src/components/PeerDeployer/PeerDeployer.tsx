import { TeachableMobileNet } from '@teachablemachine/image';
import React, { useRef, useEffect, useCallback } from 'react';
import { BehaviourType } from '../Behaviour/Behaviour';
import { generateBlob } from '../ImageWorkspace/saver';
import { useRecoilState } from 'recoil';
import { sessionCode } from '../../state';
import { sendData } from '../../util/comms';
import { Peer } from 'peerjs';

type ProjectKind = 'image';

export interface DeployEvent {
    event: 'request' | 'data';
}

export interface DeployEventRequest extends DeployEvent {
    event: 'request';
    channel: string;
}

export interface DeployEventData extends DeployEvent {
    event: 'data';
    project: Blob;
    kind: ProjectKind;
}

interface Props {
    model?: TeachableMobileNet;
    behaviours?: BehaviourType[];
}

export default function PeerDeployer({ model, behaviours }: Props) {
    const [code, setCode] = useRecoilState(sessionCode);
    const channelRef = useRef<Peer>();
    const cache = useRef<Props>({ model, behaviours });
    const blob = useRef<Blob | null>(null);

    const getChannel = useCallback(() => {
        if (channelRef.current !== undefined) return channelRef.current;
        channelRef.current = new Peer(code, {
            host: 'peer-server.blueforest-87d967c8.northeurope.azurecontainerapps.io',
            secure: true,
        });
        channelRef.current.on('open', (id: string) => {
            console.log('Connected to peer server', id);
        });
        channelRef.current.on('connection', (conn) => {
            conn.on('data', async (data: unknown) => {
                const ev = data as DeployEventRequest;
                if (ev.event === 'request') {
                    if (blob.current === null) {
                        blob.current = await generateBlob(cache.current.model, cache.current.behaviours);
                    }
                    conn.send({ event: 'data', project: blob.current, kind: 'image' });
                }
            });
        });
        return channelRef.current;
    }, [setCode]);

    useEffect(() => {
        getChannel();
        blob.current = null;
        cache.current.model = model;
        cache.current.behaviours = behaviours;
    }, [model, behaviours, getChannel]);

    return null;
}
