import { useRef, useEffect, useCallback } from 'react';
import qr from 'qrcode';
import { Dialog, DialogActions, DialogContent } from '@mui/material';
import { Button } from '../button/Button';
import { useTranslation } from 'react-i18next';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

interface Props {
    url: string;
    open: boolean;
    onClose: () => void;
}

export default function DialogQR({ url, open, onClose }: Props) {
    const { t } = useTranslation('translation');
    const canvas = useRef<HTMLCanvasElement>(null);

    const doCopy = useCallback(() => {
        navigator.clipboard.writeText(window.location.href);
    }, []);

    useEffect(() => {
        if (canvas.current) {
            qr.toCanvas(canvas.current, url, { width: 350 }).catch((e) => console.error(e));
        }
    }, [url, open]);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            keepMounted
        >
            <DialogContent>
                <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                >
                    <canvas
                        width={164}
                        height={164}
                        ref={canvas}
                    />
                </a>
            </DialogContent>
            <DialogActions>
                <Button
                    disabled={!navigator?.clipboard?.writeText}
                    onClick={doCopy}
                    variant="outlined"
                    startIcon={<ContentCopyIcon />}
                >
                    {t('deploy.actions.copy')}
                </Button>
                <Button
                    onClick={onClose}
                    variant="outlined"
                >
                    {t('deploy.actions.close')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
