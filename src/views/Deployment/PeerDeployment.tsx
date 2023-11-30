import { useState, useCallback, useEffect } from 'react';
import Deployment from './Deployment';
import { useP2PModel } from './useRemoteModel';
import { useSearchParams, useParams } from 'react-router-dom';
import QRCode from '../../components/QRCode/QRCode';
import style from './style.module.css';
import { Button } from '../../components/button/Button';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Alert, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useVariant } from '../../util/variant';
import { useTranslation } from 'react-i18next';

export function Component() {
    const { code } = useParams();
    const [query, setQuery] = useSearchParams();
    const [hadError, setHadError] = useState(false);
    const [enableWebRTC, setEnableWebRTC] = useState(false);
    const onError = useCallback(() => setHadError(true), [setHadError]);
    const [model, behaviours] = useP2PModel(code || '', onError, enableWebRTC);
    const [showQR, setShowQR] = useState(query.get('qr') === '1');
    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);

    const closeQR = useCallback(() => setShowQR(false), [setShowQR]);

    const closeError = useCallback(() => setHadError(false), [setHadError]);

    const doCopy = useCallback(() => {
        navigator.clipboard.writeText(window.location.href);
    }, []);

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
                        size="small"
                        url={window.location.href}
                    />
                    <div className={style.shareText}>
                        <span>{t('deploy.labels.share')}</span>
                        <Button
                            disabled={!navigator?.clipboard?.writeText}
                            onClick={doCopy}
                            variant="outlined"
                            startIcon={<ContentCopyIcon />}
                        >
                            {t('deploy.actions.copy')}
                        </Button>
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
        </>
    );
}
