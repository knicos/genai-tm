export function sendData(channel: string, data: unknown) {
    const c = new BroadcastChannel(channel);
    c.postMessage(data);
    c.close();
}
