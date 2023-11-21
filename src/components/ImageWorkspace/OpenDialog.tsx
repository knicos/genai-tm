import React, { useCallback } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { Button } from '../button/Button';
import { useVariant } from '../../util/variant';
import { useTranslation } from 'react-i18next';
import TextField from '@mui/material/TextField';
import style from './TeachableMachine.module.css';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { fileData, loadState, showOpenDialog } from '../../state';
import { useSearchParams } from 'react-router-dom';

export default function OpenDialog() {
    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);
    const [isopen, setShowOpenDialog] = useRecoilState(showOpenDialog);
    const setProject = useSetRecoilState(fileData);
    const [, setParams] = useSearchParams();

    const doKeyCheck = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
                const target = e.target as HTMLInputElement;
                setParams({ project: target.value });
                setShowOpenDialog(false);
            }
        },
        [setShowOpenDialog, setParams]
    );

    const doClose = useCallback(() => setShowOpenDialog(false), [setShowOpenDialog]);

    const openFile = useCallback(() => {
        document.getElementById('openfile')?.click();
    }, []);

    const loadProject = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.currentTarget.files) {
                setProject(e.currentTarget.files[0]);
                setShowOpenDialog(false);
            }
        },
        [setProject, setShowOpenDialog]
    );

    return (
        <Dialog
            open={isopen}
            onClose={doClose}
        >
            <input
                type="file"
                id="openfile"
                onChange={loadProject}
                hidden={true}
                accept=".zip,application/zip"
            />
            <DialogTitle>{t('load.title')}</DialogTitle>
            <DialogContent>
                <div className={style.openColumn}>
                    <div className={style.padded}>
                        <TextField
                            label={t<string>('load.code')}
                            variant="filled"
                            fullWidth
                            onKeyDown={doKeyCheck}
                            spellCheck={false}
                        />
                    </div>
                    <p>or</p>
                    <Button
                        variant="contained"
                        onClick={openFile}
                    >
                        {t('load.actions.openFile')}
                    </Button>
                </div>
            </DialogContent>
            <DialogActions>
                <Button
                    variant="outlined"
                    onClick={doClose}
                    data-testid="load-cancel"
                >
                    {t('load.actions.cancel')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
