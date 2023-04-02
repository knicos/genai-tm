import ReactPlayer from 'react-player/lazy';

type LinkType = 'invalid' | 'plain' | 'youtube' | 'image' | 'video' | 'facebook';

export interface LinkDetails {
    type: LinkType;
    identifier?: string;
}

function getExtension(path: string) {
    const s = path.split('.');
    return s.length > 1 ? s[s.length - 1] : '';
}

export function linkType(link: string): LinkDetails {
    try {
        const url = new URL(link);

        const canPlay = ReactPlayer.canPlay(link);
        if (canPlay) {
            return { type: 'video' };
        }

        const ext = getExtension(url.pathname);
        switch (ext) {
            case 'jpg':
            case 'jpeg':
            case 'svg':
            case 'gif':
            case 'png':
                return { type: 'image' };
            default:
                return { type: 'plain' };
        }
    } catch (e) {
        return { type: 'invalid' };
    }
}
