import { Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAtom } from 'jotai';
import { menuShowSettings } from '@genaitm/state';
import { Button } from '@genaitm/components/button/Button';
import SettingsForm, { DEFAULTS } from './SettingsForm';
import { IVariantContext } from '@genaitm/util/variant';
import { useNavigate } from 'react-router-dom';
import { compressToEncodedURIComponent } from 'lz-string';
import { VARIANTS } from '../ImageGeneral/ImageGeneral';

function delta(data: IVariantContext, template: VARIANTS): Partial<IVariantContext> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result: any = {};
    const keys = Object.keys(data) as Array<keyof IVariantContext>;
    const merged = {
        ...DEFAULTS.base,
        ...DEFAULTS[data.modelVariant],
        ...DEFAULTS[template],
    };
    for (const k of keys) {
        if (data[k] !== merged[k]) {
            result[k] = data[k];
        }
    }
    return result;
}

export default function SettingsDialog() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [showDialog, setShowDialog] = useAtom(menuShowSettings);
    const [state, setState] = useState<IVariantContext>(DEFAULTS.base);

    const doClose = useCallback(() => setShowDialog(false), [setShowDialog]);

    const doSubmit = useCallback(() => {
        const str = JSON.stringify(delta(state, 'general'));
        const urlCode = compressToEncodedURIComponent(str);
        setShowDialog(false);
        navigate(str === '{}' ? `/${state.modelVariant}/general` : `/${state.modelVariant}/general?c=${urlCode}`, {
            replace: false,
        });
    }, [state]);

    return (
        <Dialog
            open={showDialog}
            onClose={doClose}
            scroll="paper"
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>{t('settings.title')}</DialogTitle>
            <DialogContent sx={{ display: 'flex', padding: 0, maxHeight: '600px' }}>
                <SettingsForm
                    state={state}
                    setState={setState}
                />
            </DialogContent>
            <DialogActions>
                <Button
                    variant="contained"
                    onClick={doSubmit}
                >
                    {t('settings.actions.save')}
                </Button>
                <Button
                    variant="outlined"
                    onClick={() => setState(DEFAULTS.base)}
                >
                    {t('settings.actions.reset')}
                </Button>
                <Button
                    variant="outlined"
                    onClick={doClose}
                >
                    {t('settings.actions.cancel')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
