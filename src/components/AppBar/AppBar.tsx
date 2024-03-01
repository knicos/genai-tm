import React, { useCallback, useRef, useState } from 'react';
import AppBar from '@mui/material/AppBar';
import BusyButton from '../BusyButton/BusyButton';
import Toolbar from '@mui/material/Toolbar';
import { useTranslation } from 'react-i18next';
import { useVariant } from '../../util/variant';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import FileOpenIcon from '@mui/icons-material/FileOpen';
import style from './AppBar.module.css';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { loadState, saveState, showOpenDialog } from '../../state';
import SettingsIcon from '@mui/icons-material/Settings';
import { IconButton, Link as MUILink, NativeSelect } from '@mui/material';
import { createSearchParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import Suggestion from '../Suggestion/Suggestion';

interface Props {
    showReminder?: boolean;
    onSave: () => void;
}

export const LANGS = [
    { name: 'de-DE', label: 'Deutsch' },
    { name: 'en-GB', label: 'English' },
    { name: 'pt-BR', label: 'Português Brasileiro' },
    { name: 'fi-FI', label: 'Suomi' },
    { name: 'sv', label: 'Svenska' },
    { name: 'ua-UA', label: 'Українська' },
];

export default function ApplicationBar({ showReminder, onSave }: Props) {
    const [params] = useSearchParams();
    const { namespace, showSettings, showSaveReminder } = useVariant();
    const { t, i18n } = useTranslation(namespace);
    const saving = useRecoilValue(saveState);
    const navigate = useNavigate();
    const saveButtonRef = useRef(null);
    const [reminder, setReminder] = useState(true);
    const setShowOpenDialog = useSetRecoilState(showOpenDialog);
    const isloading = useRecoilValue(loadState);

    const openFile = useCallback(() => {
        setShowOpenDialog(true);
    }, [setShowOpenDialog]);

    const doChangeLanguage = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            i18n.changeLanguage(e.target.value || 'en-GB');
        },
        [i18n]
    );

    const doSettings = useCallback(() => {
        navigate(`/settings?${createSearchParams(params)}`, { replace: false });
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
                <div className={style.buttonBar}>
                    <BusyButton
                        busy={isloading}
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
                    <NativeSelect
                        value={i18n.language}
                        onChange={doChangeLanguage}
                        variant="outlined"
                        data-testid="select-lang"
                        inputProps={{ 'aria-label': t<string>('app.language') }}
                    >
                        {LANGS.map((lng) => (
                            <option
                                key={lng.name}
                                value={lng.name}
                            >
                                {lng.label}
                            </option>
                        ))}
                    </NativeSelect>
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
