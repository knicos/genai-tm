import { useCallback, useEffect, useRef, useState } from 'react';
import randomId from '../../util/randomId';
import { sendData } from '../../util/comms';
import { DeployEventData } from '../../components/PeerDeployer/PeerDeployer';
import { loadProject } from '../../components/ImageWorkspace/loader';
import { BehaviourType } from '../../components/Behaviour/Behaviour';
import { useSearchParams } from 'react-router-dom';
import { TeachableModel } from '../../util/TeachableModel';
import { BuiltinEvent, Peer2Peer, PeerEvent, usePeer, useRandom } from '@knicos/genai-base';

const TIMEOUT_LOCAL = 5000;

interface RequestEvent extends PeerEvent {
    event: 'request';
    channel: string;
    password: string | null;
}

type EventProtocol = BuiltinEvent | RequestEvent;

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
            if (ev.data.event === 'project' && ev.data.project) {
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
    disable?: boolean
): [TeachableModel | null, BehaviourType[], boolean, Peer2Peer<EventProtocol> | undefined, boolean] {
    const [model, setModel] = useState<TeachableModel | null>(null);
    const [behaviours, setBehaviours] = useState<BehaviourType[]>([]);
    const [params] = useSearchParams();
    const MYCODE = useRandom(8);
    const [enabled, setEnabled] = useState(true);

    const dataHandler = useCallback(async (data: unknown) => {
        const ev = data as DeployEventData;

        if (ev?.event === 'project' && ev.project instanceof Uint8Array) {
            try {
                const project = await loadProject(ev.project);
                if (project.model)
                    setModel(new TeachableModel('image', project.metadata, project.model, project.weights));
                console.log('Loaded model');
                if (project.behaviours) setBehaviours(project.behaviours);
            } catch (e) {
                if (onError) onError();
                console.log('Error', e);
            }
            setEnabled(false);
        }
    }, []);

    const { ready, send, peer } = usePeer<EventProtocol>({
        disabled: !enabled || disable,
        host: import.meta.env.VITE_APP_PEER_SERVER,
        secure: import.meta.env.VITE_APP_PEER_SECURE === '1',
        key: import.meta.env.VITE_APP_PEER_KEY || 'peerjs',
        port: import.meta.env.VITE_APP_PEER_PORT ? parseInt(import.meta.env.VITE_APP_PEER_PORT) : 443,
        server: `tm-${code}`,
        code: `tm-${MYCODE}`,
        onData: dataHandler,
    });

    useEffect(() => {
        if (ready && send) {
            send({ event: 'request', channel: MYCODE, password: params.get('p') });
        }
    }, [ready, send]);

    return [model, behaviours, ready, peer, enabled];
}
