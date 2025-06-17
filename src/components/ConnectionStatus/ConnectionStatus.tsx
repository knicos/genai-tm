import { ConnectionStatus as ConnStat } from '@genai-fi/base';
import style from './style.module.css';

interface Props {
    api: string;
    appName: string;
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
