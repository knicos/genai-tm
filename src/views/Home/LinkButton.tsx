import { Button } from '@mui/material';
import { PropsWithChildren } from 'react';

interface Props extends PropsWithChildren {
    href: string;
    startIcon?: React.ReactNode;
}

export default function LinkButton({ href, startIcon, children }: Props) {
    return (
        <Button
            color="primary"
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            startIcon={startIcon}
            style={{ textTransform: 'none' }}
        >
            {children}
        </Button>
    );
}
