import { IconButton } from '@mui/material';
import style from './style.module.css';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import { PropsWithChildren, useEffect, useRef } from 'react';

interface Props extends PropsWithChildren {
    title: string;
    onClose: () => void;
}

export default function CapturePanel({ title, onClose, children }: Props) {
    const { t } = useTranslation();
    const closeRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (closeRef.current) {
            closeRef.current.focus();
        }
    }, []);

    return (
        <aside className={style.container}>
            <header className={style.header}>
                <h2>{title}</h2>
                <IconButton
                    ref={closeRef}
                    data-testid="captureclose"
                    aria-label={t('aria.close')}
                    onClick={onClose}
                    color="primary"
                    size="small"
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
            </header>
            {children}
        </aside>
    );
}
