import React, { useCallback, useState, useEffect } from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import FormatColorTextIcon from '@mui/icons-material/FormatColorText';
import Popover from '@mui/material/Popover';
import { ChromePicker, ColorResult } from 'react-color';

interface Props {
    disabled?: boolean;
    colour: string;
    setColour: (v: string) => void;
}

export default function TextColour({ disabled, colour, setColour }: Props) {
    const [element, setElement] = useState<HTMLElement | null>(null);
    const [value, setValue] = useState(colour);

    useEffect(() => setValue(colour), [colour]);

    const doSelect = useCallback(
        (e: React.MouseEvent<HTMLElement>) => {
            setElement(e.currentTarget);
        },
        [setElement]
    );

    const handleClose = useCallback(() => {
        setElement(null);
    }, [setElement]);

    const doChange = useCallback(
        (newColor: ColorResult) => {
            setValue(newColor.hex);
        },
        [setValue]
    );

    const doChangeComplete = useCallback(
        (newColor: ColorResult) => {
            setColour(newColor.hex);
        },
        [setColour]
    );

    return (
        <div>
            <ToggleButton
                disabled={disabled}
                size="small"
                value="colour"
                selected={false}
                onChange={doSelect}
                aria-label="select colour"
            >
                <FormatColorTextIcon />
                <ArrowDropDownIcon />
            </ToggleButton>
            <Popover
                anchorEl={element}
                open={!!element}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
            >
                <ChromePicker
                    color={value}
                    onChange={doChange}
                    onChangeComplete={doChangeComplete}
                />
            </Popover>
        </div>
    );
}
