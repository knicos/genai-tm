import { useAtomValue } from 'jotai';
import { sessionCode } from '../../state';
import ConnectionStatus from '../ConnectionStatus/ConnectionStatus';
import { Peer } from '@genai-fi/base/hooks/peer';
import SampleProtocol from './SampleProtocol';
import ShareProtocol from './ShareProtocol';
import Monitor from './Monitor';

export default function PeerDeployer() {
    const code = useAtomValue(sessionCode);

    return (
        <Peer
            host={import.meta.env.VITE_APP_PEER_SERVER}
            secure={import.meta.env.VITE_APP_PEER_SECURE === '1'}
            peerkey={import.meta.env.VITE_APP_PEER_KEY || 'peerjs'}
            port={import.meta.env.VITE_APP_PEER_PORT ? parseInt(import.meta.env.VITE_APP_PEER_PORT) : 443}
            code={`tm-${code}`}
        >
            <ConnectionStatus
                api={import.meta.env.VITE_APP_APIURL}
                appName="tm"
                visibility={0}
            />
            <SampleProtocol />
            <ShareProtocol />
            <Monitor />
        </Peer>
    );
}
