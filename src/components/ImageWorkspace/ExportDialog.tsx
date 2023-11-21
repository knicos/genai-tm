import React, { useRef, useEffect, useCallback } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { Button } from '../button/Button';
import { useVariant } from '../../util/variant';
import { useTranslation, Trans } from 'react-i18next';
import TextField from '@mui/material/TextField';
import { useRecoilState, useRecoilValue } from 'recoil';
import { sessionCode, shareSamples, sharingActive } from '../../state';
import InputAdornment from '@mui/material/InputAdornment';
import { CircularProgress, IconButton } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import style from './TeachableMachine.module.css';

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
    const code = useRecoilValue(sessionCode);
    const sharing = useRecoilValue(sharingActive);
    const [samples, setShareSamples] = useRecoilState(shareSamples);
    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);
    const textRef = useRef<HTMLInputElement>(null);

    const link = `${process.env.REACT_APP_APIURL}/model/${code}/`;

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

    const doChangeSamples = useCallback(() => {
        setShareSamples((old) => !old);
    }, [setShareSamples]);

    return sharing ? (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
        >
            <DialogTitle>{t('share.labels.title')}</DialogTitle>
            {ready && (
                <DialogContent>
                    <p>
                        <Trans
                            i18nKey={`${namespace}:share.labels.instructions`}
                            components={{
                                scratchLink: <LinkText to="https://machinelearningforkids.co.uk/#!/pretrained" />,
                            }}
                        />
                    </p>
                    <p className={style.codeShare}>{code}</p>
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
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={samples}
                                onChange={doChangeSamples}
                            />
                        }
                        label={t('share.labels.includeSamples')}
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
