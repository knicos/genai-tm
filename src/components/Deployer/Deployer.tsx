import { TeachableMobileNet } from '@teachablemachine/image';
import React, { useRef, useEffect, useCallback } from 'react';
import { BehaviourType } from '../Behaviour/Behaviour';
import { generateBlob } from '../ImageWorkspace/saver';
import { useRecoilValue } from 'recoil';
import { sessionCode } from '../../state';
import { sendData } from '../../util/comms';

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
}

interface Props {
    model?: TeachableMobileNet;
    behaviours?: BehaviourType[];
}

export default function Deployer({ model, behaviours }: Props) {
    const code = useRecoilValue(sessionCode);
    const channelRef = useRef<BroadcastChannel>();
    // const [serializedModel, setSerializedModel] = useState<Blob | null>(null);

    const getChannel = useCallback(() => {
        if (channelRef.current !== undefined) return channelRef.current;
        channelRef.current = new BroadcastChannel(`model:${code}`);
        console.log('Deploy code is: ', code);
        return channelRef.current;
    }, [code]);

    useEffect(() => {
        const channel = getChannel();
        channel.onmessage = async (ev: MessageEvent<DeployEventRequest>) => {
            if (ev.data.event === 'request') {
                console.log('POST DATA');
                const project = await generateBlob(model, behaviours);
                sendData(ev.data.channel, { event: 'data', project });
            }
        };
    }, [model, behaviours, getChannel]);

    /*useEffect(() => {
        return () => {
            if (channelRef.current) {
                console.log('CLOSE');
                channelRef.current.close();
            }
        };
    }, []);*/

    return null;
}
