import React, { useCallback, useRef, useState } from 'react';
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
import SettingsIcon from '@mui/icons-material/Settings';
import { IconButton, Link as MUILink } from '@mui/material';
import { createSearchParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import Suggestion from '../Suggestion/Suggestion';

interface Props {
    showReminder?: boolean;
    onSave: () => void;
}

export const LANGS = [
    { name: 'en-GB', label: 'English' },
    { name: 'fi-FI', label: 'Suomi' },
];

export default function ApplicationBar({ showReminder, onSave }: Props) {
    const [params] = useSearchParams();
    const { namespace, showSettings, showSaveReminder } = useVariant();
    const { t, i18n } = useTranslation(namespace);
    const [projectFile, setProject] = useRecoilState(fileData);
    const saving = useRecoilValue(saveState);
    const navigate = useNavigate();
    const saveButtonRef = useRef(null);
    const [reminder, setReminder] = useState(true);

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

    const doSettings = useCallback(() => {
        navigate(`/image/settings?${createSearchParams(params)}`, { replace: false });
    }, [navigate, params]);

    const doSave = useCallback(() => {
        setReminder(false);
        onSave();
    }, [setReminder, onSave]);

    return (
        <AppBar
            component="nav"
            className="AppBar"
            position="static"
        >
            <Suggestion
                open={showReminder && reminder && showSaveReminder}
                anchorEl={saveButtonRef.current}
            >
                Remember to save your classifier.
            </Suggestion>
            <Toolbar>
                <Link
                    to="/about"
                    className={style.logo}
                    title="About"
                >
                    <img
                        src="/logo48.png"
                        alt="GenAI logo"
                        width="48"
                        height="48"
                    />
                    <h1>{t('app.title')}</h1>
                </Link>
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
                        onClick={doSave}
                        ref={saveButtonRef}
                    >
                        {t('app.save')}
                    </BusyButton>
                </div>
                <div className={showSettings ? style.langBarWithSettings : style.langBar}>
                    {LANGS.map((lng) => (
                        <button
                            key={lng.name}
                            data-testid={`lang-${lng.name}`}
                            data-lng={lng.name}
                            onClick={doChangeLanguage}
                            aria-label={lng.label}
                            className={i18n.language === lng.name ? style.selected : ''}
                            aria-pressed={i18n.language === lng.name}
                        >
                            <img
                                width={24}
                                height={24}
                                src={`/icons/${lng.name}.svg`}
                                alt={lng.label}
                            />
                        </button>
                    ))}
                </div>
                {showSettings && (
                    <IconButton
                        component={MUILink}
                        onClick={doSettings}
                        size="large"
                        color="inherit"
                        aria-label="Settings"
                    >
                        <SettingsIcon fontSize="large" />
                    </IconButton>
                )}
            </Toolbar>
        </AppBar>
    );
}
