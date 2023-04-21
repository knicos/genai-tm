import React from 'react';
import style from './style.module.css';
import AdsClickIcon from '@mui/icons-material/AdsClick';

export default function DnDAnimation() {
    return (
        <div
            className={style.dnd}
            aria-hidden
        >
            <AdsClickIcon
                fontSize="large"
                color="inherit"
            />
        </div>
    );
}
