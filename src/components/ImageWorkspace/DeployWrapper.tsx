import React from 'react';
import { useAtomValue } from 'jotai';
import { p2pActive } from '../../state';
import { useVariant } from '../../util/variant';
import PeerDeployer from '../PeerDeployer/PeerDeployer';
import Deployer from '../Deployer/Deployer';

export default function DeployWrapper() {
    const { usep2p } = useVariant();
    const enableP2P = useAtomValue(p2pActive);

    return (
        <React.Suspense fallback="">
            {usep2p && enableP2P && <PeerDeployer />}
            {!usep2p && <Deployer />}
        </React.Suspense>
    );
}
