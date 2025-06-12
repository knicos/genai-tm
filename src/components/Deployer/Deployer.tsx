import { useRef, useEffect, useCallback } from 'react';
import { useAtomValue, useAtom } from 'jotai';
import { behaviourState, sessionCode, sharingActive } from '../../state';
import { sendData } from '../../util/comms';
import { DeployEventRequest, DeployEventData } from '../PeerDeployer/PeerDeployer';
import { useTeachableModel } from '../../util/TeachableModel';
import ClassifierApp from '@genai-fi/classifier';

export default function Deployer() {
    const code = useAtomValue(sessionCode);
    const [, setSharing] = useAtom(sharingActive);
    const channelRef = useRef<BroadcastChannel>(undefined);
    const blob = useRef<Blob | null>(null);
    const { model } = useTeachableModel();
    const behaviours = useAtomValue(behaviourState);

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
                if (blob.current === null && model) {
                    const app = new ClassifierApp(model.getVariant(), model, behaviours);
                    app.projectId = code;
                    blob.current = await app.save();
                }
                if (blob.current) {
                    sendData<DeployEventData>(ev.data.channel || '', {
                        event: 'project',
                        project: blob.current,
                        kind: 'image',
                    });
                }
            }
        };
    }, [model, behaviours, getChannel, code]);

    return null;
}
