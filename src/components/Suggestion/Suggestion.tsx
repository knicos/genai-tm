import React, { useRef } from 'react';
import Popper from '@mui/material/Popper';
import style from './style.module.css';
import { Button } from '../button/Button';

interface Props extends React.PropsWithChildren {
    open?: boolean;
    anchorEl: HTMLElement | null;
    onClose?: () => void;
}

export default function Suggestion({ open, anchorEl, children, onClose }: Props) {
    const arrowRef = useRef(null);

    return (
        <Popper
            className={style.reminder}
            open={open || false}
            anchorEl={anchorEl}
            modifiers={[{ name: 'arrow', enabled: true, options: { element: arrowRef.current } }]}
            placement={'bottom'}
            keepMounted
        >
            <div
                id="save-remind-arrow"
                className={style.arrow}
                ref={arrowRef}
            />
            <div className={style.content}>
                <div>{children}</div>
                {onClose && (
                    <Button
                        variant="contained"
                        size="small"
                        onClick={onClose}
                    >
                        OK
                    </Button>
                )}
            </div>
        </Popper>
    );
}
