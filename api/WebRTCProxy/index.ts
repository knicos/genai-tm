import { AzureFunction, Context, HttpRequest } from '@azure/functions';
import * as ndc from 'node-datachannel';
import { WebSocket } from 'ws';
import { File } from '@web-std/file';
import { pack, unpack } from 'peerjs-js-binarypack';

global.File = File;

export interface DeployEvent {
    event: 'request' | 'project';
}

export interface DeployEventRequest extends DeployEvent {
    event: 'request';
    channel: string;
}

export interface DeployEventData extends DeployEvent {
    event: 'project';
    project: Blob;
    kind: 'image';
}

async function createWSS(url: string) {
    const ws = new WebSocket(url);

    await new Promise<void>((resolve, reject) => {
        ws.on('open', () => {
            resolve();
        });
        ws.on('error', (e) => {
            reject();
        });
    });

    return ws;
}

interface IChunkData {
    total: number;
    count: number;
    data: Buffer[];
}

const httpTrigger: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    this.navigator = {} as Navigator;
    context.log('HTTP trigger function processed a request.');
    const pwd: string = req.query.p || (req.body && req.body.p);
    const code: string = context.bindingData.id;

    const peer = new ndc.PeerConnection('Peer1', {
        iceServers: ['stun:stun.l.google.com:19302', 'turn:peerjs:peerjsp@eu-0.turn.peerjs.com:3478?transport=tcp'],
        iceTransportPolicy: 'relay',
        enableIceTcp: true,
    });

    const ws = await createWSS(
        'wss://peer-server.blueforest-87d967c8.northeurope.azurecontainerapps.io/peerjs?key=peerjs&id=proxy&token=none&version=1.4.7'
    );

    peer.onLocalDescription((sdp, type) => {
        ws.send(
            JSON.stringify({
                type: type.toUpperCase(),
                payload: {
                    browser: 'node',
                    connectionId: context.invocationId,
                    label: context.invocationId,
                    metadata: {
                        password: pwd,
                    },
                    reliable: true,
                    type: 'data',
                    serialization: 'binary',
                    sdp: {
                        type: type,
                        sdp: sdp,
                    },
                },
                dst: code,
            })
        );
    });

    peer.onLocalCandidate((candidate, mid) => {
        ws.send(
            JSON.stringify({
                type: 'CANDIDATE',
                payload: {
                    candidate: {
                        candidate,
                        sdpMid: '0',
                        sdpMLineIndex: 0,
                    },
                    type: 'data',
                    connectionId: context.invocationId,
                },
                dst: code,
            })
        );
    });

    let dc1: ndc.DataChannel;

    const chunkData = new Map<number, IChunkData>();

    return new Promise((resolve) => {
        ws.on('message', (data: any, binary) => {
            const obj = JSON.parse(binary ? data.toString() : data);
            if (obj.type === 'OPEN') {
                dc1 = peer.createDataChannel('data', { protocol: 'raw', ordered: true });
                dc1.onOpen(async () => {
                    try {
                        dc1.sendMessageBinary(Buffer.from(await pack({ event: 'request' }).arrayBuffer()));
                    } catch (e) {
                        console.error(e);
                    }
                });
                dc1.onMessage(async (msg) => {
                    const data = unpack(msg as Buffer);
                    if (data.__peerData) {
                        const cd = chunkData.get(data.__peerData) || {
                            total: data.total,
                            count: 0,
                            data: [],
                        };

                        cd.count++;
                        cd.data[data.n] = data.data;
                        chunkData.set(data.__peerData, cd);

                        if (cd.count === cd.total) {
                            const blob = new Blob(cd.data);
                            const buf = await blob.arrayBuffer();
                            const content = unpack(buf);

                            if (dc1) dc1.close();
                            peer.close();
                            ws.close();

                            context.res = {
                                headers: {
                                    'Content-Type': 'application/zip',
                                },
                                body: Buffer.from(content.project, 'base64'),
                            };

                            resolve();
                        }
                    } else {
                    }
                });
                dc1.onError((err) => console.error(err));
            } else if (obj.type === 'ANSWER' || obj.type === 'OFFER') {
                peer.setRemoteDescription(obj.payload.sdp.sdp, obj.payload.sdp.type);
            } else if (obj.type === 'CANDIDATE') {
                peer.addRemoteCandidate(obj.payload.candidate.candidate, '0');
            }
        });

        /*const peer = new Peer('', {
            host: 'peer-server.blueforest-87d967c8.northeurope.azurecontainerapps.io',
            secure: true,
        });
        peer.on('error', (err: any) => {
            console.error(err);
            peer.destroy();
        });
        peer.on('open', (id: string) => {
            const conn = peer.connect(code, { reliable: true, metadata: { password: pwd } });
            conn.on('data', async (data: unknown) => {
                const ev = data as DeployEventData;

                if (ev?.event === 'project' && ev.project instanceof ArrayBuffer) {
                    context.res = {
                        // status: 200,
                        headers: {
                            'Content-Type': 'application/zip',
                        },
                        body: ev.project,
                    };
                    conn.close();
                    peer.destroy();
                    resolve();
                }
            });
            conn.on('open', () => {
                conn.send({ event: 'request', channel: id });
            });
        });*/
    });
};

export default httpTrigger;
