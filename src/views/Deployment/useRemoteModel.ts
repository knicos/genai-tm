import { useEffect, useRef, useState } from 'react';
import randomId from '../../util/randomId';
import { sendData } from '../../util/comms';
import { DeployEventData } from '../../components/Deployer/Deployer';
import { loadProject } from '../../components/ImageWorkspace/loader';
import { TeachableMobileNet } from '@teachablemachine/image';
import { BehaviourType } from '../../components/Behaviour/Behaviour';
import { Peer } from 'peerjs';

const TIMEOUT = 5000;

export function useTabModel(code: string, onError?: () => void): [TeachableMobileNet | null, BehaviourType[]] {
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

export function useP2PModel(code: string, onError?: () => void): [TeachableMobileNet | null, BehaviourType[]] {
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
        const peer = new Peer(myCode, {
            host: 'peer-server.blueforest-87d967c8.northeurope.azurecontainerapps.io',
            secure: true,
        });
        peer.on('open', () => {
            const conn = peer.connect(code);
            conn.on('data', async (data: unknown) => {
                const ev = data as DeployEventData;
                if (ev.event === 'data') {
                    if (timeoutRef.current >= 0) {
                        clearTimeout(timeoutRef.current);
                    }
                    const project = await loadProject(ev.project);
                    if (project.model) setModel(project.model);
                    if (project.behaviours) setBehaviours(project.behaviours);
                }
            });
            conn.on('open', () => {
                conn.send({ event: 'request', channel: myCode });
            });
        });
    }, [code, myCode, onError]);

    return [model, behaviours];
}
