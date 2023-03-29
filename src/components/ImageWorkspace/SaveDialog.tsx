import React, { useState, useCallback, FormEvent } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { Button } from '../button/Button';
import { Checkbox, FormControlLabel } from '@mui/material';
import { useVariant } from '../../util/variant';
import { useTranslation } from 'react-i18next';

export interface SaveProperties {
    samples: boolean;
    model: boolean;
    behaviours: boolean;
}

interface Props {
    trigger?: () => void;
    onSave: (props: SaveProperties) => void;
    hasModel?: boolean;
}

export default function SaveDialog({ trigger, onSave, hasModel }: Props) {
    const { namespace, disableSaveSamples } = useVariant();
    const { t } = useTranslation(namespace);

    const [saveSamples, setSaveSamples] = useState(false);
    const [saveBehaviours, setSaveBehaviours] = useState(true);

    const changeSamples = useCallback(
        (event: FormEvent<HTMLInputElement>) => {
            setSaveSamples(event.currentTarget.checked);
        },
        [setSaveSamples]
    );

    const changeBehaviours = useCallback(
        (event: FormEvent<HTMLInputElement>) => {
            setSaveBehaviours(event.currentTarget.checked);
        },
        [setSaveBehaviours]
    );

    const doSave = useCallback(() => {
        onSave({
            samples: saveSamples,
            model: true,
            behaviours: saveBehaviours,
        });
        if (trigger) trigger();
    }, [trigger, onSave, saveBehaviours, saveSamples]);

    return (
        <Dialog
            open={!!trigger}
            onClose={trigger}
        >
            <DialogTitle>{t('save.title')}</DialogTitle>
            <DialogContent>
                <p>{hasModel ? t('save.message') : t('save.noModel')}</p>
                {!disableSaveSamples && (
                    <FormControlLabel
                        control={
                            <Checkbox
                                data-testid="check-save-samples"
                                checked={saveSamples}
                                onChange={changeSamples}
                            />
                        }
                        label={t('save.saveSamples')}
                    />
                )}
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={true}
                            disabled={true}
                        />
                    }
                    label={t('save.saveClassifier')}
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            data-testid="check-save-behaviours"
                            disabled={!hasModel}
                            checked={saveBehaviours}
                            onChange={changeBehaviours}
                        />
                    }
                    label={t('save.saveBehaviours')}
                />
            </DialogContent>
            <DialogActions>
                <Button
                    variant="contained"
                    disabled={!hasModel}
                    onClick={doSave}
                    data-testid="save-save"
                >
                    {t('save.actions.save')}
                </Button>
                <Button
                    variant="outlined"
                    onClick={trigger}
                    data-testid="save-cancel"
                >
                    {t('save.actions.cancel')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
