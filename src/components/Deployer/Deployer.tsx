import { TeachableMobileNet } from '@teachablemachine/image';
import React, { useRef, useEffect, useCallback } from 'react';
import { BehaviourType } from '../Behaviour/Behaviour';
import { generateBlob } from '../ImageWorkspace/saver';
import { useRecoilValue } from 'recoil';
import { sessionCode } from '../../state';
import { sendData } from '../../util/comms';

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

export default function Deployer({ model, behaviours }: Props) {
    const code = useRecoilValue(sessionCode);
    const channelRef = useRef<BroadcastChannel>();
    const blob = useRef<Blob | null>(null);

    const getChannel = useCallback(() => {
        if (channelRef.current !== undefined) return channelRef.current;
        channelRef.current = new BroadcastChannel(`model:${code}`);
        return channelRef.current;
    }, [code]);

    useEffect(() => {
        const channel = getChannel();
        blob.current = null;
        channel.onmessage = async (ev: MessageEvent<DeployEventRequest>) => {
            if (ev.data.event === 'request') {
                if (blob.current === null) {
                    blob.current = await generateBlob(model, behaviours);
                }
                sendData<DeployEventData>(ev.data.channel, { event: 'data', project: blob.current, kind: 'image' });
            }
        };
    }, [model, behaviours, getChannel]);

    return null;
}
