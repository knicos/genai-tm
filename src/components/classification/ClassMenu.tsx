import React from "react";
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';

interface Props {
    hasSamples: boolean;
    onDeleteClass: () => void;
    onRemoveSamples: () => void;
}

export default function ClassMenu({hasSamples, onDeleteClass, onRemoveSamples}: Props) {
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
        }}>Delete Class</MenuItem>
        <MenuItem disabled={!hasSamples} onClick={() => {
            handleClose();
            onRemoveSamples();
        }}>Remove all samples</MenuItem>
      </Menu>
    </div>;
}