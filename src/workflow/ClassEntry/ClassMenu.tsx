import React, { useCallback } from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import MenuIcon from '@mui/icons-material/Menu';
import DeleteIcon from '@mui/icons-material/Delete';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import GridViewIcon from '@mui/icons-material/GridView';
import GroupIcon from '@mui/icons-material/Group';
import { useTranslation } from 'react-i18next';
import { useVariant } from '../../util/variant';
import { useAtom, useAtomValue } from 'jotai';
import { fatalWebcam, p2pActive, sessionCode, sharingActive } from '../../state';
import Alert from '@mui/material/Alert';
import style from './classification.module.css';
import { BusyButton, QRCode } from '@genai-fi/base';

interface Props {
    index: number;
    hasSamples: boolean;
    isDisabled?: boolean;
    disableCollaboration?: boolean;
    onDeleteClass?: () => void;
    onRemoveSamples: () => void;
    onToggleDisable?: () => void;
    onDatasets?: () => void;
}

export default function ClassMenu({
    hasSamples,
    index,
    isDisabled,
    disableCollaboration,
    onDeleteClass,
    onRemoveSamples,
    onToggleDisable,
    onDatasets,
}: Props) {
    const code = useAtomValue(sessionCode);
    const sharing = useAtomValue(sharingActive);
    const [p2penabled, setP2PEnabled] = useAtom(p2pActive);
    const { namespace, disabledClassRemove, enabledP2PData, enableCollaboration, sampleDatasets } = useVariant();
    const { t, i18n } = useTranslation(namespace);
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const fatal = useAtomValue(fatalWebcam);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const doCollab = useCallback(() => {
        setP2PEnabled(true);
    }, [setP2PEnabled]);

    return (
        <div>
            <IconButton
                aria-label={t('trainingdata.aria.more')}
                id={`class-menu-button-${index}`}
                aria-controls={open ? `class-menu-${index}` : undefined}
                aria-expanded={open ? 'true' : undefined}
                aria-haspopup="true"
                onClick={handleClick}
                size="small"
            >
                <MenuIcon fontSize="small" />
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
                {!disabledClassRemove && onDeleteClass && (
                    <MenuItem
                        key="delete"
                        onClick={() => {
                            handleClose();
                            onDeleteClass();
                        }}
                    >
                        <ListItemIcon>
                            <DeleteIcon fontSize="small" />
                        </ListItemIcon>
                        {t('trainingdata.actions.deleteClass')}
                    </MenuItem>
                )}
                {onToggleDisable && (
                    <MenuItem
                        onClick={() => {
                            handleClose();
                            onToggleDisable();
                        }}
                    >
                        <ListItemIcon>
                            {isDisabled ? <CheckCircleIcon fontSize="small" /> : <BlockIcon fontSize="small" />}
                        </ListItemIcon>
                        {isDisabled ? t('trainingdata.actions.enableClass') : t('trainingdata.actions.disableClass')}
                    </MenuItem>
                )}
                <MenuItem
                    disabled={!hasSamples}
                    onClick={() => {
                        handleClose();
                        onRemoveSamples();
                    }}
                >
                    <ListItemIcon>
                        <DeleteSweepIcon fontSize="small" />
                    </ListItemIcon>
                    {t('trainingdata.actions.removeAll')}
                </MenuItem>
                {sampleDatasets && onDatasets && (
                    <MenuItem
                        key="datasets"
                        onClick={() => {
                            handleClose();
                            onDatasets();
                        }}
                    >
                        <ListItemIcon>
                            <GridViewIcon fontSize="small" />
                        </ListItemIcon>
                        {t('trainingdata.actions.datasets')}
                    </MenuItem>
                )}
                {!disableCollaboration &&
                    enabledP2PData &&
                    enableCollaboration &&
                    !fatal && [
                        <div
                            key="sharebox"
                            className={style.shareBox}
                        >
                            {!sharing && (
                                <BusyButton
                                    busy={p2penabled && !sharing}
                                    onClick={doCollab}
                                    variant="contained"
                                    style={{ margin: '1rem 0' }}
                                    startIcon={<GroupIcon />}
                                >
                                    {t('trainingdata.actions.collaborate')}
                                </BusyButton>
                            )}
                            {sharing && (
                                <QRCode
                                    dialog
                                    size="small"
                                    url={`${window.location.origin}/collect/${code}/${index}?lng=${i18n.language}`}
                                />
                            )}
                            {index === 0 && (
                                <Alert
                                    data-testid="alert-useqr"
                                    severity="info"
                                >
                                    <p>{t('trainingdata.labels.qrMessage')}</p>
                                </Alert>
                            )}
                        </div>,
                    ]}
            </Menu>
        </div>
    );
}
