import React, { useRef, useEffect } from 'react';
import style from './style.module.css';
import Alert from '@mui/material/Alert';

interface Props extends React.PropsWithChildren {
    severity: 'info' | 'warning' | 'error';
    open?: boolean;
    onClose: () => void;
    timeout?: number;
}

export default function AlertModal({ severity, open, onClose, children, timeout }: Props) {
    const timerRef = useRef(-1);

    useEffect(() => {
        if (timeout !== 0) {
            if (open) {
                if (timerRef.current >= 0) {
                    clearTimeout(timerRef.current);
                }
                timerRef.current = window.setTimeout(() => {
                    timerRef.current = -1;
                    onClose();
                }, timeout || 5000);
            } else {
                if (timerRef.current >= 0) {
                    clearTimeout(timerRef.current);
                }
            }
        }
    }, [open, onClose, timeout]);

    return open ? (
        <div className={style.alertModal}>
            <Alert
                severity={severity}
                onClose={onClose}
            >
                {children}
            </Alert>
        </div>
    ) : null;
}
