import React, { useState, useCallback, FormEvent } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { Button } from '../button/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import { useVariant } from '../../util/variant';
import { useTranslation } from 'react-i18next';
import { useTeachableModel } from '../../util/TeachableModel';
import TextField from '@mui/material/TextField';
import style from './TeachableMachine.module.css';

export interface SaveProperties {
    samples: boolean;
    model: boolean;
    behaviours: boolean;
    name: string;
}

interface Props {
    trigger?: () => void;
    onSave: (props: SaveProperties) => void;
}

export default function SaveDialog({ trigger, onSave }: Props) {
    const { namespace, disableSaveSamples } = useVariant();
    const { t } = useTranslation(namespace);
    const { canPredict } = useTeachableModel();
    const [saveSamples, setSaveSamples] = useState(!disableSaveSamples);
    const [saveBehaviours, setSaveBehaviours] = useState(true);
    const [name, setName] = useState('My Model');

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
            name,
        });
        if (trigger) trigger();
    }, [trigger, onSave, saveBehaviours, saveSamples, name]);

    const doNameChange = useCallback(
        (ev: React.ChangeEvent<HTMLInputElement>) => {
            setName(ev.target.value);
        },
        [setName]
    );

    return (
        <Dialog
            open={!!trigger}
            onClose={trigger}
        >
            <DialogTitle>{t('save.title')}</DialogTitle>
            <DialogContent>
                <p>{canPredict ? t('save.message') : t('save.noModel')}</p>
                <div className={style.padded}>
                    <TextField
                        label={t('save.name')}
                        variant="filled"
                        fullWidth
                        value={name}
                        onChange={doNameChange}
                    />
                </div>
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
                            disabled={!canPredict}
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
                    disabled={!canPredict}
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
