import { useCallback, useEffect, useRef } from 'react';
import style from './Input.module.css';
import { BusyButton, QRCode } from '@genai-fi/base';
import { useAtom, useAtomValue } from 'jotai';
import { inputImage, p2pActive, sessionCode, sharingActive } from '@genaitm/state';
import { useVariant } from '@genaitm/util/variant';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@mui/material';

export default function RemoteInput() {
    const { namespace } = useVariant();
    const { t, i18n } = useTranslation(namespace);
    const remoteImageRef = useRef<HTMLDivElement>(null);
    const remoteInput = useAtomValue(inputImage);
    const code = useAtomValue(sessionCode);
    const sharing = useAtomValue(sharingActive);
    const [p2penabled, setP2PEnabled] = useAtom(p2pActive);

    const doCollab = useCallback(() => {
        setP2PEnabled(true);
    }, [setP2PEnabled]);

    useEffect(() => {
        if (remoteImageRef.current && remoteInput) {
            while (remoteImageRef.current.firstChild) {
                remoteImageRef.current.removeChild(remoteImageRef.current.firstChild);
            }
            remoteInput.style.width = '224px';
            remoteInput.style.height = '224px';
            remoteImageRef.current.appendChild(remoteInput);
        }
    }, [remoteInput]);

    return (
        <>
            <div className={style.qrcode}>
                {!sharing && (
                    <BusyButton
                        busy={p2penabled && !sharing}
                        onClick={doCollab}
                        variant="contained"
                        style={{ margin: '1rem 0' }}
                    >
                        {t('trainingdata.actions.collaborate')}
                    </BusyButton>
                )}
                {sharing && (
                    <QRCode
                        dialog
                        size="small"
                        url={`${window.location.origin}/input/${code}?lng=${i18n.language}`}
                    />
                )}
            </div>
            {!!remoteInput && (
                <div
                    role="img"
                    aria-label={t('input.aria.imageFile')}
                    ref={remoteImageRef}
                    className={style.fileImage}
                />
            )}
            {!remoteInput && (
                <Skeleton
                    sx={{ marginTop: '1rem' }}
                    variant="rounded"
                    width={224}
                    height={224}
                />
            )}
        </>
    );
}
