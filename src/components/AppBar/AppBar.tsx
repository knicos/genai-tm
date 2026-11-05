import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useVariant } from '../../util/variant';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import FileOpenIcon from '@mui/icons-material/FileOpen';
import style from './AppBar.module.css';
import { useAtomValue, useSetAtom } from 'jotai';
import { featureFlagsAtom, loadState, menuShowSettings, saveState, showOpenDialog } from '../../state';
import SettingsIcon from '@mui/icons-material/Settings';
import { IconButton, Link as MUILink, Tooltip } from '@mui/material';
import Suggestion from '../Suggestion/Suggestion';
import { BusyButton, Button, ReportDialog, LangSelect } from '@genai-fi/base';
import ReportIcon from '@mui/icons-material/Report';

interface Props {
    showReminder?: boolean;
    onSave: () => void;
}

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
    const { allowReportProblem } = useAtomValue(featureFlagsAtom);
    const [showReportDialog, setShowReportDialog] = useState(false);

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
                    {allowReportProblem && (
                        <Tooltip
                            title={t('app.reportProblemTip')}
                            arrow
                        >
                            <Button
                                variant="outlined"
                                color="inherit"
                                startIcon={<ReportIcon fontSize="small" />}
                                sx={{ fontSize: '0.75rem', marginRight: '1rem' }}
                                onClick={() => setShowReportDialog(true)}
                            >
                                {t('app.reportProblem')}
                            </Button>
                        </Tooltip>
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
                {allowReportProblem && showReportDialog && (
                    <ReportDialog
                        application="tm"
                        apiURL={import.meta.env.VITE_APP_API}
                        open={showReportDialog}
                        onClose={() => setShowReportDialog(false)}
                    />
                )}
            </div>
        </nav>
    );
}
