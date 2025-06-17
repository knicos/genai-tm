import ReactPlayer from 'react-player/lazy';
import { linkType } from '../Behaviour/links';

interface Props {
    url: string;
    show?: boolean;
    volume?: number;
}

export default function Embedding({ url, show, volume }: Props) {
    const details = linkType(url);

    return details.type === 'video' ? (
        <ReactPlayer
            url={url}
            width={400}
            height={350}
            playing={show}
            loop={true}
            controls={false}
            volume={volume || 1}
            style={{ display: show ? 'initial' : 'none' }}
            data-testid="react-player"
        />
    ) : (
        <img
            data-testid="embed-image"
            src={url}
            alt=""
        />
    );
}
