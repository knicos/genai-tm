import React, { useCallback, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { Button } from '@genaitm/components/button/Button';
import { useVariant } from '../../util/variant';
import { useTranslation } from 'react-i18next';
import TextField from '@mui/material/TextField';
import style from './TeachableMachine.module.css';
import { useAtom, useSetAtom } from 'jotai';
import { fileData, showOpenDialog } from '../../state';
import { useSearchParams } from 'react-router-dom';
import FileOpenIcon from '@mui/icons-material/FileOpen';

export default function OpenDialog() {
    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);
    const [isopen, setShowOpenDialog] = useAtom(showOpenDialog);
    const setProject = useSetAtom(fileData);
    const [, setParams] = useSearchParams();
    const [codeValue, setCodeValue] = useState<string>('');

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

    const doOpenCode = useCallback(() => {
        setParams({ project: codeValue });
        setShowOpenDialog(false);
    }, [setParams, setShowOpenDialog, codeValue]);

    const doChangeCode = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setCodeValue(e.currentTarget.value);
    }, []);

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
                            label={t('load.code')}
                            variant="outlined"
                            fullWidth
                            onKeyDown={doKeyCheck}
                            value={codeValue}
                            onChange={doChangeCode}
                            spellCheck={false}
                            color={codeValue.length === 8 ? 'success' : codeValue.length > 0 ? 'error' : 'primary'}
                        />
                    </div>
                    <Button
                        variant="contained"
                        onClick={doOpenCode}
                        fullWidth
                        disabled={codeValue.length < 8}
                    >
                        {t('load.actions.openCode')}
                    </Button>
                    <div className={style.spacer} />
                    <Button
                        variant="contained"
                        onClick={openFile}
                        startIcon={<FileOpenIcon />}
                        fullWidth
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
