import React, { useCallback } from 'react';
import AppBar from '@mui/material/AppBar';
import BusyButton from '../BusyButton/BusyButton';
import Toolbar from '@mui/material/Toolbar';
import { useTranslation } from 'react-i18next';
import { useVariant } from '../../util/variant';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import FileOpenIcon from '@mui/icons-material/FileOpen';
import style from './AppBar.module.css';
import { useRecoilState, useRecoilValue } from 'recoil';
import { fileData, saveState } from '../../state';

interface Props {
    onSave: () => void;
}

const LANGS = [
    { name: 'en-GB', label: 'English' },
    { name: 'fi-FI', label: 'Suomi' },
];

export default function ApplicationBar({ onSave }: Props) {
    const { namespace } = useVariant();
    const { t, i18n } = useTranslation(namespace);
    const [projectFile, setProject] = useRecoilState(fileData);
    const saving = useRecoilValue(saveState);

    const openFile = useCallback(() => {
        document.getElementById('openfile')?.click();
    }, []);

    const loadProject = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.currentTarget.files) {
                setProject(e.currentTarget.files[0]);
            }
        },
        [setProject]
    );

    const doChangeLanguage = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            i18n.changeLanguage(e.currentTarget.getAttribute('data-lng') || 'en');
        },
        [i18n]
    );

    return (
        <AppBar
            component="nav"
            className="AppBar"
            position="static"
        >
            <Toolbar>
                <h1>{t('app.title')}</h1>
                <input
                    type="file"
                    id="openfile"
                    onChange={loadProject}
                    hidden={true}
                    accept=".zip,application/zip"
                />
                <div className={style.buttonBar}>
                    <BusyButton
                        busy={!!projectFile}
                        data-testid="open-project"
                        color="inherit"
                        variant="outlined"
                        startIcon={<FileOpenIcon />}
                        onClick={openFile}
                    >
                        {t('app.load')}
                    </BusyButton>
                    <BusyButton
                        busy={!!saving}
                        data-testid="save-project"
                        color="inherit"
                        variant="outlined"
                        startIcon={<SaveAltIcon />}
                        onClick={onSave}
                    >
                        {t('app.save')}
                    </BusyButton>
                </div>
                <div className={style.langBar}>
                    {LANGS.map((lng) => (
                        <button
                            key={lng.name}
                            data-testid={`lang-${lng.name}`}
                            data-lng={lng.name}
                            onClick={doChangeLanguage}
                            aria-label={lng.label}
                        >
                            <img
                                className={i18n.language === lng.name ? style.selected : ''}
                                width={24}
                                src={`/icons/${lng.name}.svg`}
                                alt={lng.label}
                            />
                        </button>
                    ))}
                </div>
            </Toolbar>
        </AppBar>
    );
}
