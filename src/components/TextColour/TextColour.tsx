import React, { useCallback, useState, useEffect } from 'react';
import ToggleButton from '@mui/material/ToggleButton';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import FormatColorTextIcon from '@mui/icons-material/FormatColorText';
import Popover from '@mui/material/Popover';
import { ChromePicker, ColorResult } from 'react-color';
import { useTranslation } from 'react-i18next';
import { useVariant } from '../../util/variant';

interface Props {
    disabled?: boolean;
    colour: string;
    setColour: (v: string) => void;
}

export default function TextColour({ disabled, colour, setColour }: Props) {
    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);
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
                aria-label={t('fontcolor.aria.title')}
                id="colour-button"
                aria-controls={element ? 'colour-menu' : undefined}
                aria-expanded={element ? 'true' : undefined}
                aria-haspopup="true"
            >
                <FormatColorTextIcon />
                <ArrowDropDownIcon />
            </ToggleButton>
            <Popover
                aria-labelledby="colour-button"
                id="colour-menu"
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
