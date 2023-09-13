import { useEffect, useRef, useState } from 'react';
import { DataConnection, Peer } from 'peerjs';
import { SampleStateValue } from '../../components/ImageGrid/Sample';

const TIMEOUT_P2P = 30000;

type ConnectionStatus = 'connecting' | 'connected' | 'disconnected';

type SampleSender = (img: HTMLCanvasElement, classIndex: number, id: string) => void;
type SampleDelete = (classIndex: number, id: string) => void;

interface SampleFuncs {
    send: SampleSender;
    delete: SampleDelete;
}

async function checkWebRTC() {
    const stream = await navigator?.mediaDevices?.getUserMedia({ video: true });
    stream.getTracks().forEach(function (track) {
        track.stop();
    });
}

export function usePeerSender(
    code: string,
    onError: () => void,
    onSampleState: (id: string, state: SampleStateValue) => void
): [SampleSender | null, SampleDelete | null, string[], ConnectionStatus] {
    const [sampleFuncs, setSampleFuncs] = useState<SampleFuncs | null>(null);
    const [classLabels, setClassLabels] = useState<string[]>([]);
    const timeoutRef = useRef<number>(-1);
    const pollRef = useRef<number>(-1);
    const pollWaiting = useRef(false);
    const [status, setStatus] = useState<ConnectionStatus>('disconnected');
    const peerRef = useRef<Peer>();
    const connRef = useRef<DataConnection>();

    useEffect(() => {
        checkWebRTC()
            .then(() => {
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
                    console.error(err);
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
                            setStatus('disconnected');
                            setTimeout(() => setStatus('connecting'), 4000);
                            break;
                        default:
                            break;
                    }
                });
                peer.on('disconnected', () => {
                    setTimeout(() => {
                        if (!peer.destroyed) peer.reconnect();
                    }, 5000);
                });
                peer.on('close', () => {
                    setStatus('disconnected');
                });

                peer.on('open', (id: string) => {
                    setStatus('connecting');
                });
            })
            .catch(() => {
                console.error('WebRTC not allowed');
            });

        return () => {
            if (timeoutRef.current >= 0) clearTimeout(timeoutRef.current);
            if (pollRef.current >= 0) clearInterval(pollRef.current);
            peerRef.current?.destroy();
        };
    }, [onError]);

    useEffect(() => {
        if (status === 'connecting' && peerRef.current) {
            console.log('Connecting to peer', code);
            const conn = peerRef.current.connect(code, { reliable: true });
            connRef.current = conn;

            timeoutRef.current = window.setTimeout(() => {
                conn.close();
                onError();
            }, TIMEOUT_P2P);

            conn.on('iceStateChanged', (state: string) => {
                if (state === 'disconnected') {
                    conn.close();
                }
            });

            conn.on('data', async (data: any) => {
                if (data?.event === 'class') {
                    pollWaiting.current = false;
                    setClassLabels(data.labels);
                } else if (data?.event === 'sample_state') {
                    onSampleState(data?.id, data?.state);
                }
            });
            conn.on('error', (err: unknown) => {
                console.log('Error', err);
            });
            conn.on('close', () => {
                setStatus('disconnected');
                setSampleFuncs(null);
                if (timeoutRef.current >= 0) clearTimeout(timeoutRef.current);
                if (pollRef.current >= 0) clearInterval(pollRef.current);
                pollWaiting.current = false;
                setTimeout(() => setStatus('connecting'), 2000);
                connRef.current = undefined;
            });
            conn.on('open', () => {
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
                }, 5000);
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
    }, [status, code, onError, onSampleState]);

    return sampleFuncs ? [sampleFuncs.send, sampleFuncs.delete, classLabels, status] : [null, null, [], status];
}
