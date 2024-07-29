import React, { useCallback } from 'react';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { useTranslation } from 'react-i18next';
import { useVariant } from '../../util/variant';

export type Align = 'left' | 'right' | 'center';

interface Props {
    disabled?: boolean;
    alignment: Align;
    setAlignment: (v: Align) => void;
}

export default function Alignment({ disabled, alignment, setAlignment }: Props) {
    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);

    const handleAlignment = useCallback(
        (_: React.MouseEvent<HTMLElement>, newAlignment: Align | null) => {
            setAlignment(newAlignment || alignment);
        },
        [alignment, setAlignment]
    );

    return (
        <ToggleButtonGroup
            value={alignment}
            exclusive
            onChange={handleAlignment}
            aria-label={t('alignment.aria.align')}
            disabled={disabled}
            size="small"
        >
            <ToggleButton
                value="left"
                aria-label={t('alignment.aria.left')}
            >
                <FormatAlignLeftIcon />
            </ToggleButton>
            <ToggleButton
                value="center"
                aria-label={t('alignment.aria.center')}
            >
                <FormatAlignCenterIcon />
            </ToggleButton>
            <ToggleButton
                value="right"
                aria-label={t('alignment.aria.right')}
            >
                <FormatAlignRightIcon />
            </ToggleButton>
        </ToggleButtonGroup>
    );
}
