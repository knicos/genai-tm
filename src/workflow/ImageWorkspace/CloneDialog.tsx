import { useRef, useEffect, useCallback } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { Button } from '@genaitm/components/button/Button';
import { useVariant } from '../../util/variant';
import { useTranslation } from 'react-i18next';
import { useAtom, useAtomValue } from 'jotai';
import { modelShared, sessionCode, shareModel, shareSamples } from '@genaitm/state';
import { CircularProgress, IconButton } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import style from './TeachableMachine.module.css';
import { BusyButton } from '@genai-fi/base';

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

export default function CloneDialog({ open, onClose, ready }: Props) {
    const code = useAtomValue(sessionCode);
    const [samples, setShareSamples] = useAtom(shareSamples);
    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);
    const textRef = useRef<HTMLInputElement>(null);
    const [shared, setShared] = useAtom(shareModel);
    const sharedModel = useAtomValue(modelShared);

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

    const doCopyCode = useCallback(() => {
        navigator.clipboard.writeText(code);
    }, [code]);

    const doChangeSamples = useCallback(() => {
        setShareSamples((old) => !old);
    }, [setShareSamples]);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
        >
            <DialogTitle>{t('model.actions.clone')}</DialogTitle>
            {ready && (
                <DialogContent>
                    <p>{t(`${namespace}:share.labels.codeInstructions`)}</p>
                    <div className={style.codeContainer}>
                        <p className={style.codeShare}>{code}</p>
                        <IconButton
                            disabled={!navigator?.clipboard?.writeText}
                            onClick={doCopyCode}
                        >
                            <ContentCopyIcon />
                        </IconButton>
                    </div>
                    <div className={style.incImagesContainer}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={samples}
                                    onChange={doChangeSamples}
                                />
                            }
                            label={t('share.labels.includeSamples')}
                        />
                    </div>
                </DialogContent>
            )}
            {!ready && (
                <DialogContent>
                    <CircularProgress />
                </DialogContent>
            )}
            <DialogActions>
                <BusyButton
                    busy={!ready || (shared && !sharedModel)}
                    variant="contained"
                    onClick={() => setShared((old) => !old)}
                    data-testid="share-share"
                >
                    {sharedModel && shared ? t('share.actions.stopShare') : t('share.actions.share')}
                </BusyButton>
                <Button
                    variant="outlined"
                    onClick={onClose}
                    data-testid="share-close"
                >
                    {t('share.actions.close')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
