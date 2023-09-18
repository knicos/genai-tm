import { useEffect, useRef, useState } from 'react';
import { DataConnection, Peer } from 'peerjs';
import { SampleStateValue } from '../../components/ImageGrid/Sample';
import { useRecoilValue } from 'recoil';
import { webrtcActive } from '../../state';

const TIMEOUT_P2P = 30000;
const RECONNECT_TIMER_1 = 2000;
const RECONNECT_TIMER_2 = 5000;
const POLLING = 5000;
const MAX_RETRY = 5;

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'failed';

type SampleSender = (img: HTMLCanvasElement, classIndex: number, id: string) => void;
type SampleDelete = (classIndex: number, id: string) => void;

interface SampleFuncs {
    send: SampleSender;
    delete: SampleDelete;
}

interface ReturnObject {
    sender?: SampleSender;
    deleter?: SampleDelete;
    classNames: string[];
    state: ConnectionStatus;
}

export function usePeerSender(
    code: string,
    onError: () => void,
    onSampleState: (id: string, state: SampleStateValue) => void,
    onSamplesUpdate?: (samples: Set<string>[]) => void
): ReturnObject {
    const [sampleFuncs, setSampleFuncs] = useState<SampleFuncs | null>(null);
    const [classLabels, setClassLabels] = useState<string[]>([]);
    const timeoutRef = useRef<number>(-1);
    const pollRef = useRef<number>(-1);
    const pollWaiting = useRef(false);
    const [status, setStatus] = useState<ConnectionStatus>('disconnected');
    const peerRef = useRef<Peer>();
    const connRef = useRef<DataConnection>();
    const webRTC = useRecoilValue(webrtcActive);
    const retryRef = useRef(0);

    useEffect(() => {
        if (webRTC) {
            if (peerRef.current && !peerRef.current.destroyed) return;
            peerRef.current = new Peer('', {
                host: process.env.REACT_APP_PEER_SERVER,
                secure: process.env.REACT_APP_PEER_SECURE === '1',
                key: process.env.REACT_APP_PEER_KEY || 'peerjs',
                port: process.env.REACT_APP_PEER_PORT ? parseInt(process.env.REACT_APP_PEER_PORT) : 443,
                config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }], sdpSemantics: 'unified-plan' },
            });

            const peer = peerRef.current;

            peer.on('error', (err: any) => {
                console.error(err.type, err);
                if (timeoutRef.current >= 0) {
                    clearTimeout(timeoutRef.current);
                }
                onError();
                // peer.destroy();

                switch (err.type) {
                    case 'browser-incompatible':
                    case 'disconnected':
                    case 'invalid-id':
                    case 'invalid-key':
                    case 'ssl-unavailable':
                    case 'server-error':
                    case 'socket-error':
                    case 'socket-closed':
                    case 'unavailable-id':
                    case 'webrtc':
                        peer.destroy();
                        setStatus('disconnected');
                        break;
                    case 'network':
                    case 'peer-unavailable':
                        if (connRef.current) connRef.current.close();
                        retryRef.current++;
                        if (retryRef.current > MAX_RETRY) {
                            setStatus('failed');
                        } else {
                            setStatus('disconnected');
                            setTimeout(() => setStatus('connecting'), RECONNECT_TIMER_2);
                        }
                        break;
                    default:
                        break;
                }
            });
            peer.on('disconnected', () => {
                setTimeout(() => {
                    if (!peer.destroyed) peer.reconnect();
                }, RECONNECT_TIMER_2);
            });
            peer.on('close', () => {
                setStatus('disconnected');
            });

            peer.on('open', (id: string) => {
                setStatus('connecting');
            });
        }

        return () => {
            if (timeoutRef.current >= 0) clearTimeout(timeoutRef.current);
            if (pollRef.current >= 0) clearInterval(pollRef.current);
            peerRef.current?.destroy();
        };
    }, [onError, webRTC]);

    useEffect(() => {
        if (status === 'connecting' && peerRef.current) {
            console.log('Connecting to peer', code);
            if (!peerRef.current.open) {
                setStatus('disconnected');
                peerRef.current.reconnect();
                return;
            }
            const conn = peerRef.current.connect(code, { reliable: true });
            connRef.current = conn;

            if (!conn) return;

            timeoutRef.current = window.setTimeout(() => {
                conn.close();
                onError();
            }, TIMEOUT_P2P);

            conn.on('iceStateChanged', (state: string) => {
                console.log('ICE', state);
                if (state === 'disconnected' || state === 'failed') {
                    conn.close();
                }
            });

            conn.on('data', async (data: any) => {
                if (data?.event === 'class') {
                    pollWaiting.current = false;
                    setClassLabels(data.labels);

                    const newSampleIDs = data.samples.map((s: string[]) => {
                        const newSet = new Set<string>();
                        s.forEach((a) => newSet.add(a));
                        return newSet;
                    });

                    if (onSamplesUpdate) onSamplesUpdate(newSampleIDs);
                } else if (data?.event === 'sample_state') {
                    onSampleState(data?.id, data?.state);
                    conn.send({ event: 'request_class' });
                }
            });
            conn.on('error', (err: unknown) => {
                console.log('Error', err);
            });
            conn.on('close', () => {
                retryRef.current++;
                if (retryRef.current > MAX_RETRY) {
                    setStatus('failed');
                } else {
                    setStatus('disconnected');
                    setTimeout(() => setStatus('connecting'), RECONNECT_TIMER_1);
                }
                setSampleFuncs(null);
                if (timeoutRef.current >= 0) clearTimeout(timeoutRef.current);
                if (pollRef.current >= 0) clearInterval(pollRef.current);
                pollWaiting.current = false;
                connRef.current = undefined;
            });
            conn.on('open', () => {
                retryRef.current = 0;

                if (timeoutRef.current >= 0) {
                    clearTimeout(timeoutRef.current);
                }

                conn.send({ event: 'request_class' });
                pollRef.current = window.setInterval(() => {
                    if (pollWaiting.current) {
                        return;
                    }
                    pollWaiting.current = true;
                    conn.send({ event: 'request_class' });
                }, POLLING);
                setStatus('connected');
                setSampleFuncs({
                    send: (img: HTMLCanvasElement, classIndex: number, id: string) => {
                        conn.send({ event: 'add_sample', data: img.toDataURL(), index: classIndex, id });
                    },
                    delete: (classIndex: number, id: string) => {
                        conn.send({ event: 'delete_sample', index: classIndex, id });
                    },
                });
            });
        }
    }, [status, code, onError, onSampleState, onSamplesUpdate]);

    return {
        sender: sampleFuncs ? sampleFuncs.send : undefined,
        deleter: sampleFuncs ? sampleFuncs.delete : undefined,
        classNames: classLabels,
        state: status,
    };
}
