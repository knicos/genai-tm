import { Peer } from '@genai-fi/base/hooks/peer';
import ProjectProtocol from './ProjectProtocol';
import { useRandom } from '@genai-fi/base';
import { TeachableModel } from '@genai-fi/classifier';
import { BehaviourType } from '@genaitm/workflow/Behaviour/Behaviour';
import ConnectionStatus from '@genaitm/components/ConnectionStatus/ConnectionStatus';

interface Props {
    code: string;
    onModel: (model: TeachableModel) => void;
    onBehaviours: (behaviours: BehaviourType[]) => void;
    onError?: () => void;
    onDone: () => void;
}

export default function RemoteModel({ code, ...props }: Props) {
    const MYCODE = useRandom(8);

    return (
        <Peer
            host={import.meta.env.VITE_APP_PEER_SERVER}
            secure={import.meta.env.VITE_APP_PEER_SECURE === '1'}
            peerkey={import.meta.env.VITE_APP_PEER_KEY || 'peerjs'}
            port={import.meta.env.VITE_APP_PEER_PORT ? parseInt(import.meta.env.VITE_APP_PEER_PORT) : 443}
            code={`tm-${MYCODE}`}
            server={`tm-${code}`}
        >
            <ProjectProtocol
                code={code}
                {...props}
            />
            <ConnectionStatus
                api={import.meta.env.VITE_APP_APIURL}
                appName="tm"
                visibility={0}
                noCheck
            />
        </Peer>
    );
}
