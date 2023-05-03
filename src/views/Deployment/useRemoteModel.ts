import { useEffect, useRef, useState } from 'react';
import randomId from '../../util/randomId';
import { sendData } from '../../util/comms';
import { DeployEventData } from '../../components/PeerDeployer/PeerDeployer';
import { loadProject } from '../../components/ImageWorkspace/loader';
import { TeachableMobileNet } from '@teachablemachine/image';
import { BehaviourType } from '../../components/Behaviour/Behaviour';
import { Peer } from 'peerjs';
import { useSearchParams } from 'react-router-dom';

const TIMEOUT_LOCAL = 5000;
const TIMEOUT_P2P = 15000;

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
            timeoutRef.current = window.setTimeout(() => onError(), TIMEOUT_LOCAL);
        }
        channel.current = new BroadcastChannel(`deployment:${myCode}`);
        channel.current.onmessage = async (ev: MessageEvent<DeployEventData>) => {
            if (ev.data.event === 'project') {
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
    const timeoutRef = useRef<number>(-1);
    const [params] = useSearchParams();

    useEffect(() => {
        const peer = new Peer('', {
            host: process.env.REACT_APP_PEER_SERVER,
            secure: true,
        });
        peer.on('error', (err: any) => {
            console.error(err);
            if (timeoutRef.current >= 0) {
                clearTimeout(timeoutRef.current);
            }
            if (onError) onError();
            peer.destroy();
        });
        peer.on('open', (id: string) => {
            const conn = peer.connect(code, { reliable: true, metadata: { password: params.get('p') } });
            conn.on('data', async (data: unknown) => {
                const ev = data as DeployEventData;

                if (ev?.event === 'project' && ev.project instanceof ArrayBuffer) {
                    if (timeoutRef.current >= 0) {
                        clearTimeout(timeoutRef.current);
                    }

                    try {
                        const project = await loadProject(ev.project);
                        if (project.model) setModel(project.model);
                        if (project.behaviours) setBehaviours(project.behaviours);
                    } catch (e) {
                        if (onError) onError();
                    }
                    conn.close();
                    peer.destroy();
                }
            });
            conn.on('open', () => {
                if (onError) {
                    if (timeoutRef.current >= 0) {
                        clearTimeout(timeoutRef.current);
                    }
                    timeoutRef.current = window.setTimeout(() => {
                        conn.close();
                        peer.destroy();
                        onError();
                    }, TIMEOUT_P2P);
                }
                conn.send({ event: 'request', channel: id });
            });
        });
    }, [code, onError, params]);

    return [model, behaviours];
}
