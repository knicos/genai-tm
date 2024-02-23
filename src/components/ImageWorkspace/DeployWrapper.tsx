import React from 'react';
import { useRecoilValue } from 'recoil';
import { iceConfig, p2pActive } from '../../state';
import { useVariant } from '../../util/variant';
import PeerDeployer from '../PeerDeployer/PeerDeployer';
import Deployer from '../Deployer/Deployer';

export default function DeployWrapper() {
    const { usep2p } = useVariant();
    const enableP2P = useRecoilValue(p2pActive);
    const ice = useRecoilValue(iceConfig);

    return (
        <React.Suspense fallback="">
            {usep2p && enableP2P && ice && <PeerDeployer />}
            {!usep2p && <Deployer />}
        </React.Suspense>
    );
}
