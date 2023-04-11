import React from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useTranslation } from 'react-i18next';
import { useVariant } from '../../util/variant';

interface Props {
    index: number;
    hasSamples: boolean;
    onDeleteClass: () => void;
    onRemoveSamples: () => void;
}

export default function ClassMenu({ hasSamples, index, onDeleteClass, onRemoveSamples }: Props) {
    const { namespace, disabledClassRemove } = useVariant();
    const { t } = useTranslation(namespace);
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <div>
            <IconButton
                aria-label={t<string>('trainingdata.aria.more')}
                id={`class-menu-button-${index}`}
                aria-controls={open ? `class-menu-${index}` : undefined}
                aria-expanded={open ? 'true' : undefined}
                aria-haspopup="true"
                onClick={handleClick}
                size="small"
            >
                <MoreVertIcon fontSize="small" />
            </IconButton>
            <Menu
                MenuListProps={{
                    'aria-labelledby': `class-menu-button-${index}`,
                }}
                id={`class-menu-${index}`}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
            >
                {!disabledClassRemove && (
                    <MenuItem
                        onClick={() => {
                            handleClose();
                            onDeleteClass();
                        }}
                    >
                        {t('trainingdata.actions.deleteClass')}
                    </MenuItem>
                )}
                <MenuItem
                    disabled={!hasSamples}
                    onClick={() => {
                        handleClose();
                        onRemoveSamples();
                    }}
                >
                    {t('trainingdata.actions.removeAll')}
                </MenuItem>
            </Menu>
        </div>
    );
}
