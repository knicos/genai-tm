import React, { useCallback } from 'react';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

export type Align = 'left' | 'right' | 'center';

interface Props {
    disabled?: boolean;
    alignment: Align;
    setAlignment: (v: Align) => void;
}

export default function Alignment({ disabled, alignment, setAlignment }: Props) {
    const handleAlignment = useCallback(
        (event: React.MouseEvent<HTMLElement>, newAlignment: Align | null) => {
            setAlignment(newAlignment || alignment);
        },
        [alignment, setAlignment]
    );

    return (
        <ToggleButtonGroup
            value={alignment}
            exclusive
            onChange={handleAlignment}
            aria-label="text alignment"
            disabled={disabled}
            size="small"
        >
            <ToggleButton
                value="left"
                aria-label="left aligned"
            >
                <FormatAlignLeftIcon />
            </ToggleButton>
            <ToggleButton
                value="center"
                aria-label="centered"
            >
                <FormatAlignCenterIcon />
            </ToggleButton>
            <ToggleButton
                value="right"
                aria-label="right aligned"
            >
                <FormatAlignRightIcon />
            </ToggleButton>
        </ToggleButtonGroup>
    );
}
