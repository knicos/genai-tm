import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useVariant } from '../../util/variant';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import FileOpenIcon from '@mui/icons-material/FileOpen';
import style from './AppBar.module.css';
import { useAtomValue, useSetAtom } from 'jotai';
import { feedbackAtom, loadState, menuShowSettings, saveState, showOpenDialog } from '../../state';
import SettingsIcon from '@mui/icons-material/Settings';
import { IconButton, Link as MUILink } from '@mui/material';
import Suggestion from '../Suggestion/Suggestion';
import { BusyButton, Feedback, LangSelect } from '@genai-fi/base';

interface Props {
    showReminder?: boolean;
    onSave: () => void;
}

const FEEDBACK_DELAY = 30 * 1000;

export const LANGS = [
    { name: 'de-DE', label: 'Deutsch' },
    { name: 'en-GB', label: 'English' },
    { name: 'pt-BR', label: 'Português Brasileiro' },
    { name: 'fr-FR', label: 'Français' },
    { name: 'fi-FI', label: 'Suomi' },
    { name: 'it-IT', label: 'Italiano' },
    { name: 'ja-JP', label: '日本語' },
    { name: 'kr-KR', label: '한국어' },
    { name: 'krl-FI', label: 'Karjala' },
    { name: 'si-LK', label: 'සිංහල' },
    { name: 'sv', label: 'Svenska' },
    { name: 'sw', label: 'Swahili' },
    { name: 'ru-RU', label: 'русский язык' },
    { name: 'tr-TR', label: 'Türkçe' },
    { name: 'ua-UA', label: 'Українська' },
];

export default function ApplicationBar({ showReminder, onSave }: Props) {
    const { namespace, showSettings, showSaveReminder } = useVariant();
    const { t } = useTranslation(namespace);
    const saving = useAtomValue(saveState);
    const saveButtonRef = useRef(null);
    const [reminder, setReminder] = useState(true);
    const setShowOpenDialog = useSetAtom(showOpenDialog);
    const isloading = useAtomValue(loadState);
    const setShowSettings = useSetAtom(menuShowSettings);
    const showFeedback = useAtomValue(feedbackAtom);

    const openFile = useCallback(() => {
        setShowOpenDialog(true);
    }, [setShowOpenDialog]);

    const doSettings = useCallback(() => {
        //navigate(`/settings?${createSearchParams(params)}`, { replace: false });
        setShowSettings(true);
    }, [setShowSettings]);

    const doSave = useCallback(() => {
        setReminder(false);
        onSave();
    }, [setReminder, onSave]);

    return (
        <nav className={style.appbar}>
            <Suggestion
                open={showReminder && reminder && showSaveReminder}
                anchorEl={saveButtonRef.current}
            >
                Remember to save your classifier.
            </Suggestion>
            <div className={style.toolbar}>
                <a
                    href="/"
                    className={style.logo}
                    title="Home"
                >
                    <img
                        src="/logo128_bw.png"
                        alt="GenAI logo"
                        width="48"
                        height="48"
                    />
                </a>
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
                    {showFeedback && (
                        <Feedback
                            application="tm"
                            variant="contained"
                            delay={FEEDBACK_DELAY}
                            apiUrl={import.meta.env.VITE_FEEDBACK_URL}
                            style={{ marginRight: '1rem' }}
                        />
                    )}
                    <LangSelect
                        languages={LANGS}
                        dark
                        ns="image_adv"
                    />
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
            </div>
        </nav>
    );
}
