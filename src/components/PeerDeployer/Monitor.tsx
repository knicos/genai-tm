import { usePeerStatus } from '@genai-fi/base/hooks/peer';
import { sharingActive } from '@genaitm/state';
import { useSetAtom } from 'jotai';
import { useEffect } from 'react';

export default function Monitor() {
    const status = usePeerStatus();

    const setSharing = useSetAtom(sharingActive);

    useEffect(() => {
        console.log('Peer status changed:', status);
        setSharing(status === 'ready');
    }, [status]);

    return null;
}
