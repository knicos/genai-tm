import { useState, useCallback, useEffect } from 'react';
import Deployment from './Deployment';
import { useP2PModel } from './useRemoteModel';
import { useSearchParams, useParams } from 'react-router-dom';
import style from './style.module.css';
import { Alert, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useVariant } from '../../util/variant';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import { fatalWebcam } from '@genaitm/state';
import AlertModal from '@genaitm/components/AlertModal/AlertModal';
import { Privacy, QRCode } from '@knicos/genai-base';
import gitInfo from '../../generatedGitInfo.json';
import ConnectionStatus from '@genaitm/components/ConnectionStatus/ConnectionStatus';

export function Component() {
    const { code } = useParams();
    const [query, setQuery] = useSearchParams();
    const [hadError, setHadError] = useState(false);
    const [enableWebRTC, setEnableWebRTC] = useState(false);
    const onError = useCallback(() => setHadError(true), [setHadError]);
    const [model, behaviours, ready, peer, enabledP2P] = useP2PModel(code || '', onError, !enableWebRTC);
    const [showQR, setShowQR] = useState(query.get('qr') === '1');
    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);
    const fatal = useRecoilValue(fatalWebcam);

    const closeQR = useCallback(() => setShowQR(false), [setShowQR]);

    const closeError = useCallback(() => setHadError(false), [setHadError]);

    const doActivated = useCallback(
        (available: boolean) => {
            // Remove this if TURN servers are used
            if (!available) setHadError(true);
            setEnableWebRTC(true);
        },
        [setEnableWebRTC, setHadError]
    );

    useEffect(() => {
        query.delete('qr');
        setQuery(query);
    }, [query, setQuery]);

    return (
        <>
            <Deployment
                model={model}
                behaviours={behaviours}
                error={hadError}
                onCloseError={closeError}
                onActivated={doActivated}
            />
            {showQR && (
                <div className={style.qrcode}>
                    <QRCode
                        dialog
                        size="small"
                        url={window.location.href}
                    />
                    <div className={style.shareText}>
                        <span>{t('deploy.labels.share')}</span>
                        <Alert severity="info">
                            <p>{t('deploy.labels.qrExpand')}</p>
                        </Alert>
                    </div>
                    <div className={style.qrclose}>
                        <IconButton
                            size="large"
                            onClick={closeQR}
                        >
                            <CloseIcon fontSize="large" />
                        </IconButton>
                    </div>
                </div>
            )}
            {fatal && (
                <AlertModal
                    open={true}
                    severity="error"
                    onClose={() => {}}
                >
                    {t('deploy.labels.noWebcam')}
                </AlertModal>
            )}
            {enabledP2P && (
                <ConnectionStatus
                    api={import.meta.env.VITE_APP_APIURL}
                    appName="tm"
                    ready={ready}
                    peer={peer}
                    visibility={0}
                    noCheck
                />
            )}
            <Privacy
                position="topRight"
                appName="tm"
                tag={gitInfo.gitTag || 'notag'}
            />
        </>
    );
}
