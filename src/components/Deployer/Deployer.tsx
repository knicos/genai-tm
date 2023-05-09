import { TeachableMobileNet } from '@teachablemachine/image';
import React, { useRef, useEffect, useCallback } from 'react';
import { BehaviourType } from '../Behaviour/Behaviour';
import { ModelContents, generateBlob } from '../ImageWorkspace/saver';
import { useRecoilValue, useRecoilState } from 'recoil';
import { sessionCode, sharingActive } from '../../state';
import { sendData } from '../../util/comms';
import { DeployEventRequest, DeployEventData } from '../PeerDeployer/PeerDeployer';

interface Props {
    model?: TeachableMobileNet;
    behaviours?: BehaviourType[];
}

export default function Deployer({ model, behaviours }: Props) {
    const code = useRecoilValue(sessionCode);
    const [, setSharing] = useRecoilState(sharingActive);
    const channelRef = useRef<BroadcastChannel>();
    const blob = useRef<ModelContents | null>(null);

    const getChannel = useCallback(() => {
        if (channelRef.current !== undefined) return channelRef.current;
        channelRef.current = new BroadcastChannel(`model:${code}`);
        setSharing(true);
        return channelRef.current;
    }, [code, setSharing]);

    useEffect(() => {
        const channel = getChannel();
        blob.current = null;
        channel.onmessage = async (ev: MessageEvent<DeployEventRequest>) => {
            if (ev.data.event === 'request') {
                if (blob.current === null) {
                    blob.current = await generateBlob(model, behaviours);
                }
                if (blob.current.zip) {
                    sendData<DeployEventData>(ev.data.channel || '', {
                        event: 'project',
                        project: blob.current.zip,
                        kind: 'image',
                    });
                }
            }
        };
    }, [model, behaviours, getChannel]);

    return null;
}
