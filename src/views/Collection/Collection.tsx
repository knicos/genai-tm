import { useParams } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { theme, useRandom } from '@genai-fi/base';
import ConnectionStatus from '@genaitm/components/ConnectionStatus/ConnectionStatus';
import { Peer } from '@genai-fi/base/hooks/peer';
import { SampleCollector } from './SampleCollector';

export function Component() {
    const { code } = useParams();
    const MYCODE = useRandom(8);

    return (
        <ThemeProvider theme={theme}>
            <Peer
                host={import.meta.env.VITE_APP_PEER_SERVER}
                secure={import.meta.env.VITE_APP_PEER_SECURE === '1'}
                peerkey={import.meta.env.VITE_APP_PEER_KEY || 'peerjs'}
                port={import.meta.env.VITE_APP_PEER_PORT ? parseInt(import.meta.env.VITE_APP_PEER_PORT) : 443}
                code={`tm-${MYCODE}`}
                server={`tm-${code}`}
            >
                <SampleCollector />
                <ConnectionStatus
                    api={import.meta.env.VITE_APP_APIURL}
                    appName="tm"
                    visibility={0}
                    noCheck
                />
            </Peer>
        </ThemeProvider>
    );
}
