import { useEffect, useRef, useState } from 'react';
import randomId from '../../util/randomId';
import { sendData } from '../../util/comms';
import { DeployEventData } from '../../components/PeerDeployer/PeerDeployer';
import { loadProject } from '../../components/ImageWorkspace/loader';
import { BehaviourType } from '../../components/Behaviour/Behaviour';
import { Peer } from 'peerjs';
import { useSearchParams } from 'react-router-dom';
import { TeachableModel } from '../../util/TeachableModel';

const TIMEOUT_LOCAL = 5000;
const TIMEOUT_P2P = 30000;

export function useTabModel(code: string, onError?: () => void): [TeachableModel | null, BehaviourType[]] {
    const channel = useRef<BroadcastChannel>();
    const [model, setModel] = useState<TeachableModel | null>(null);
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
                if (project.model)
                    setModel(new TeachableModel('image', project.metadata, project.model, project.weights));
                if (project.behaviours) setBehaviours(project.behaviours);
            }
        };
        sendData(`model:${code}`, { event: 'request', channel: `deployment:${myCode}` });
    }, [code, myCode, onError]);

    return [model, behaviours];
}

export function useP2PModel(
    code: string,
    onError?: () => void,
    enabled?: boolean
): [TeachableModel | null, BehaviourType[]] {
    const [model, setModel] = useState<TeachableModel | null>(null);
    const [behaviours, setBehaviours] = useState<BehaviourType[]>([]);
    const timeoutRef = useRef<number>(-1);
    const [params] = useSearchParams();

    useEffect(() => {
        if (!enabled) {
            return;
        }
        const peer = new Peer('', {
            host: process.env.REACT_APP_PEER_SERVER,
            secure: process.env.REACT_APP_PEER_SECURE === '1',
            key: process.env.REACT_APP_PEER_KEY || 'peerjs',
            port: process.env.REACT_APP_PEER_PORT ? parseInt(process.env.REACT_APP_PEER_PORT) : 443,
            config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }], sdpSemantics: 'unified-plan' },
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
            const conn = peer.connect(code, { reliable: true });
            conn.on('data', async (data: unknown) => {
                const ev = data as DeployEventData;

                if (ev?.event === 'project' && ev.project instanceof ArrayBuffer) {
                    if (timeoutRef.current >= 0) {
                        clearTimeout(timeoutRef.current);
                    }

                    try {
                        const project = await loadProject(ev.project);
                        if (project.model)
                            setModel(new TeachableModel('image', project.metadata, project.model, project.weights));
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
                conn.send({ event: 'request', channel: id, password: params.get('p') });
            });
        });
    }, [code, onError, params, enabled]);

    return [model, behaviours];
}
