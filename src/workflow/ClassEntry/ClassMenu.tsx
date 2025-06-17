import React, { useCallback } from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
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
    onDeleteClass: () => void;
    onRemoveSamples: () => void;
}

export default function ClassMenu({ hasSamples, index, onDeleteClass, onRemoveSamples }: Props) {
    const code = useAtomValue(sessionCode);
    const sharing = useAtomValue(sharingActive);
    const [p2penabled, setP2PEnabled] = useAtom(p2pActive);
    const { namespace, disabledClassRemove, enabledP2PData, enableCollaboration } = useVariant();
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
                {enabledP2PData && enableCollaboration && !fatal && (
                    <div className={style.shareBox}>
                        {!sharing && (
                            <BusyButton
                                busy={p2penabled && !sharing}
                                onClick={doCollab}
                                variant="contained"
                                style={{ margin: '1rem 0' }}
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
                    </div>
                )}
            </Menu>
        </div>
    );
}
