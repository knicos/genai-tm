import React, { useRef, useEffect, useCallback } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { Button } from '@genaitm/components/button/Button';
import { useVariant } from '../../util/variant';
import { useTranslation, Trans } from 'react-i18next';
import TextField from '@mui/material/TextField';
import { useAtomValue } from 'jotai';
import { sessionCode, sharingActive } from '../../state';
import InputAdornment from '@mui/material/InputAdornment';
import { CircularProgress, IconButton } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

export interface SaveProperties {
    samples: boolean;
    model: boolean;
    behaviours: boolean;
}

interface Props {
    open: boolean;
    ready?: boolean;
    onClose: () => void;
}

interface LinkProps extends React.PropsWithChildren {
    to: string;
}

function LinkText(props: LinkProps) {
    return (
        <a
            target="_blank"
            rel="noreferrer"
            href={props.to}
        >
            {props.children}
        </a>
    );
}

export default function ExportDialog({ open, onClose, ready }: Props) {
    const code = useAtomValue(sessionCode);
    const sharing = useAtomValue(sharingActive);
    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);
    const textRef = useRef<HTMLInputElement>(null);

    const link = `${import.meta.env.VITE_APP_APIURL}/model/${code}/`;

    useEffect(() => {
        if (open) {
            setTimeout(() => {
                if (textRef.current) {
                    textRef.current.focus();
                    textRef.current.select();
                }
            }, 200);
        }
    }, [open]);

    const doCopy = useCallback(() => {
        navigator.clipboard.writeText(link);
    }, [link]);

    return sharing ? (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
        >
            <DialogTitle>{t('model.actions.export')}</DialogTitle>
            {ready && (
                <DialogContent>
                    <p>
                        <Trans
                            i18nKey={`${namespace}:share.labels.linkInstructions`}
                            components={{
                                scratchLink: <LinkText to="https://machinelearningforkids.co.uk/#!/pretrained" />,
                            }}
                        />
                    </p>
                    <TextField
                        inputRef={textRef}
                        sx={{ marginTop: '2rem' }}
                        fullWidth
                        autoFocus
                        label="Link"
                        variant="outlined"
                        value={link}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        disabled={!navigator?.clipboard?.writeText}
                                        onClick={doCopy}
                                    >
                                        <ContentCopyIcon />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                </DialogContent>
            )}
            {!ready && (
                <DialogContent>
                    <CircularProgress />
                </DialogContent>
            )}
            <DialogActions>
                <Button
                    variant="contained"
                    onClick={onClose}
                    data-testid="share-close"
                >
                    {t('share.actions.close')}
                </Button>
            </DialogActions>
        </Dialog>
    ) : null;
}
