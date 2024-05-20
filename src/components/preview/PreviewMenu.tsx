import React from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useTranslation } from 'react-i18next';
import { useVariant } from '../../util/variant';
import { useRecoilValue } from 'recoil';
import { fatalWebcam } from '@genaitm/state';
import { ListItemIcon, ListItemText } from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

interface Props {
    disabled?: boolean;
    onExport?: () => void;
    onClone?: () => void;
}

export default function PreviewMenu({ disabled, onExport, onClone }: Props) {
    const { namespace, usep2p, allowModelSharing } = useVariant();
    const { t } = useTranslation(namespace);
    const fatal = useRecoilValue(fatalWebcam);
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
                aria-label={t<string>('model.aria.more')}
                id={`preview-menu-button`}
                aria-controls={open ? `preview-menu` : undefined}
                aria-expanded={open ? 'true' : undefined}
                aria-haspopup="true"
                onClick={handleClick}
                size="small"
            >
                <MoreVertIcon fontSize="small" />
            </IconButton>
            <Menu
                MenuListProps={{
                    'aria-labelledby': `preview-menu-button`,
                }}
                id={`preview-menu`}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
            >
                <MenuItem
                    disabled={disabled || !onClone || !usep2p || !allowModelSharing || fatal}
                    onClick={() => {
                        handleClose();
                        if (onClone) onClone();
                    }}
                >
                    <ListItemIcon>
                        <ContentCopyIcon />
                    </ListItemIcon>
                    <ListItemText>{t('model.actions.clone')}</ListItemText>
                </MenuItem>
                <MenuItem
                    disabled={disabled || !onExport || !usep2p || !allowModelSharing || fatal}
                    onClick={() => {
                        handleClose();
                        if (onExport) onExport();
                    }}
                >
                    <ListItemIcon>
                        <ShareIcon />
                    </ListItemIcon>
                    <ListItemText>{t('model.actions.export')}</ListItemText>
                </MenuItem>
            </Menu>
        </div>
    );
}
