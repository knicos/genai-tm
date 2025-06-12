import { ConnectionStatus as ConnStat, Peer2Peer, PeerEvent } from '@genai-fi/base';
import style from './style.module.css';

interface Props {
    api: string;
    appName: string;
    ready?: boolean;
    peer?: Peer2Peer<PeerEvent>;
    noCheck?: boolean;
    visibility?: number;
}

export default function ConnectionStatus(props: Props) {
    return (
        <div className={style.container}>
            <ConnStat {...props} />
        </div>
    );
}
