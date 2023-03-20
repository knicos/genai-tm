import React from "react";
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useTranslation } from 'react-i18next';
import { useVariant } from "../../util/variant";

interface Props {
    hasSamples: boolean;
    onDeleteClass: () => void;
    onRemoveSamples: () => void;
}

export default function ClassMenu({hasSamples, onDeleteClass, onRemoveSamples}: Props) {
    const {namespace} = useVariant();
    const {t} = useTranslation(namespace);
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
      setAnchorEl(null);
    };

    return <div><IconButton
        aria-label="more"
        id="class-menu"
        aria-controls={open ? 'long-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        onClick={handleClick}
        size="small"
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>
      <Menu
        id="class-menu"
        MenuListProps={{
          'aria-labelledby': 'long-button',
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <MenuItem onClick={() => {
            handleClose();
            onDeleteClass();
        }}>{t("trainingdata.actions.deleteClass")}</MenuItem>
        <MenuItem disabled={!hasSamples} onClick={() => {
            handleClose();
            onRemoveSamples();
        }}>{t("trainingdata.actions.removeAll")}</MenuItem>
      </Menu>
    </div>;
}