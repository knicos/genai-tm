import React from 'react';
import { Button } from '../button/Button';
import CircularProgress from '@mui/material/CircularProgress';

interface Props extends React.ComponentProps<typeof Button> {
    busy?: boolean;
}

export default function BusyButton({ busy, ...props }: Props) {
    return (
        <Button
            {...props}
            disabled={busy || props.disabled}
            sx={{
                ...props.sx,
                '& .MuiCircularProgress-root': {
                    width: '20px !important',
                    height: '20px !important',
                },
            }}
            startIcon={busy ? <CircularProgress /> : props.startIcon}
        >
            {props.children}
        </Button>
    );
}
