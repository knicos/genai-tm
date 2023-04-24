import React from 'react';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import style from './style.module.css';

interface Props extends React.PropsWithChildren {
    severity: 'none' | 'info' | 'warn' | 'error' | 'success';
    hideIcon?: boolean;
    isolated?: boolean;
}

export default function AlertPara({ severity, children, hideIcon, isolated }: Props) {
    return (
        <p className={style[severity] + (isolated ? ` ${style.isolated}` : '')}>
            {!hideIcon && severity === 'info' && <InfoOutlinedIcon fontSize="small" />}
            {children}
        </p>
    );
}
