import { useRef, useEffect, useState, KeyboardEvent, Suspense } from 'react';
import qr from 'qrcode';
import style from './style.module.css';
import DialogQR from './DialogQR';

interface Props {
    url: string;
    size?: 'small' | 'normal' | 'large';
}

export default function QRCode({ url, size }: Props) {
    const [open, setOpen] = useState(false);
    const canvas = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (canvas.current) {
            qr.toCanvas(canvas.current, url, { width: size === 'small' ? 164 : size === 'large' ? 350 : 250 }).catch(
                (e) => console.error(e)
            );
        }
    }, [url]);

    return (
        <div className={style.container}>
            <canvas
                aria-label="QR code, click to expand it"
                width={164}
                height={164}
                ref={canvas}
                onClick={() => setOpen(true)}
                tabIndex={0}
                className={style.canvas}
                onKeyDown={(e: KeyboardEvent) => {
                    if (e.key === 'Enter') setOpen(true);
                }}
            />
            <Suspense>
                <DialogQR
                    url={url}
                    open={open}
                    onClose={() => setOpen(false)}
                />
            </Suspense>
        </div>
    );
}
