import { useRef, useEffect, useCallback } from 'react';
import { ModelContents, generateBlob } from '../ImageWorkspace/saver';
import { useRecoilValue, useRecoilState } from 'recoil';
import { behaviourState, sessionCode, sharingActive } from '../../state';
import { sendData } from '../../util/comms';
import { DeployEventRequest, DeployEventData } from '../PeerDeployer/PeerDeployer';
import { useTeachableModel } from '../../util/TeachableModel';

export default function Deployer() {
    const code = useRecoilValue(sessionCode);
    const [, setSharing] = useRecoilState(sharingActive);
    const channelRef = useRef<BroadcastChannel>();
    const blob = useRef<ModelContents | null>(null);
    const { model } = useTeachableModel();
    const behaviours = useRecoilValue(behaviourState);

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
                    blob.current = await generateBlob(code, model, behaviours);
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
    }, [model, behaviours, getChannel, code]);

    return null;
}
