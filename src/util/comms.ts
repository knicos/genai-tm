export function sendData<T>(channel: string, data: T) {
    const c = new BroadcastChannel(channel);
    c.postMessage(data);
    c.close();
}
