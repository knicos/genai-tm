import { useRef, useEffect } from 'react';
import qr from 'qrcode';
import { Dialog, DialogActions, DialogContent } from '@mui/material';
import { Button } from '../button/Button';
import { useTranslation } from 'react-i18next';

interface Props {
    url: string;
    open: boolean;
    onClose: () => void;
}

export default function DialogQR({ url, open, onClose }: Props) {
    const { t } = useTranslation('translation');
    const canvas = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (canvas.current) {
            qr.toCanvas(canvas.current, url, { width: 350 }).catch((e) => console.error(e));
        } else {
            console.error('NO CANVAS');
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
                    onClick={onClose}
                    variant="outlined"
                >
                    {t('deploy.actions.close')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
