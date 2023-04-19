import { useEffect, useRef, useState } from 'react';
import randomId from '../../util/randomId';
import { sendData } from '../../util/comms';
import { DeployEventData } from '../../components/Deployer/Deployer';
import { loadProject } from '../../components/ImageWorkspace/loader';
import { TeachableMobileNet } from '@teachablemachine/image';
import { BehaviourType } from '../../components/Behaviour/Behaviour';

const TIMEOUT = 5000;

export default function useRemoteModel(
    code: string,
    onError?: () => void
): [TeachableMobileNet | null, BehaviourType[]] {
    const channel = useRef<BroadcastChannel>();
    const [model, setModel] = useState<TeachableMobileNet | null>(null);
    const [behaviours, setBehaviours] = useState<BehaviourType[]>([]);
    const [myCode] = useState(() => randomId(8));
    const timeoutRef = useRef<number>(-1);

    useEffect(() => {
        if (onError) {
            if (timeoutRef.current >= 0) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = window.setTimeout(() => onError(), TIMEOUT);
        }
        channel.current = new BroadcastChannel(`deployment:${myCode}`);
        channel.current.onmessage = async (ev: MessageEvent<DeployEventData>) => {
            if (ev.data.event === 'data') {
                if (timeoutRef.current >= 0) {
                    clearTimeout(timeoutRef.current);
                }
                const project = await loadProject(ev.data.project);
                if (project.model) setModel(project.model);
                if (project.behaviours) setBehaviours(project.behaviours);
            }
        };
        sendData(`model:${code}`, { event: 'request', channel: `deployment:${myCode}` });
    }, [code, myCode, onError]);

    return [model, behaviours];
}
