import React, { useCallback } from 'react';
import TextDecreaseIcon from '@mui/icons-material/TextDecrease';
import TextIncreaseIcon from '@mui/icons-material/TextIncrease';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

export type Align = 'left' | 'right' | 'center';

interface Props {
    disabled?: boolean;
    size: number;
    setSize: (v: number) => void;
}

const RATE = 2;

export default function FontSize({ disabled, size, setSize }: Props) {
    const handleChange = useCallback(
        (event: React.MouseEvent<HTMLElement>, direction: ('increase' | 'decrease')[]) => {
            if (direction[0] === 'increase') {
                setSize(size + RATE);
            } else {
                setSize(size - RATE);
            }
        },
        [size, setSize]
    );

    return (
        <ToggleButtonGroup
            onChange={handleChange}
            aria-label="text size"
            disabled={disabled}
            size="small"
        >
            <ToggleButton
                value="increase"
                aria-label="left aligned"
            >
                <TextIncreaseIcon />
            </ToggleButton>
            <ToggleButton
                value="decrease"
                aria-label="centered"
            >
                <TextDecreaseIcon />
            </ToggleButton>
        </ToggleButtonGroup>
    );
}
