import { useState, useCallback } from 'react';
import style from './stepper.module.css';
import { useTranslation } from 'react-i18next';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import AppBar from '../../components/AppBar/AppBar';
import Workspace from '../../components/ImageWorkspace/Workspace';
import { ThemeProvider } from '@mui/material/styles';
import { useVariant } from '../../util/variant';
import Fab from '@mui/material/Fab';
import { theme } from '../../style/theme';

export default function ImageClassifier() {
    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);
    const [step, setStep] = useState(0);
    const [allowedStep, setAllowedStep] = useState(0);
    const [visited, setVisited] = useState(0);
    const [saveTrigger, setSaveTrigger] = useState<(() => void) | undefined>(undefined);
    const [showReminder, setShowReminder] = useState(false);

    const doComplete = useCallback(
        (newstep: number) => {
            setAllowedStep((old: number) => Math.max(old, newstep));
        },
        [setAllowedStep]
    );

    const doSkip = useCallback(
        (newstep: number) => {
            setAllowedStep((old: number) => Math.max(old, newstep));
            setStep(newstep);
            setVisited(newstep);
        },
        [setAllowedStep, setStep]
    );

    const doSaveRemind = useCallback(() => setShowReminder(true), [setShowReminder]);

    const nextStep = useCallback(() => {
        setStep(step + 1);
        setVisited((oldVisited) => Math.max(oldVisited, step + 1));
    }, [setStep, setVisited, step]);

    const doSave = useCallback(() => setSaveTrigger(() => () => setSaveTrigger(undefined)), [setSaveTrigger]);

    return (
        <ThemeProvider theme={theme}>
            <AppBar
                onSave={doSave}
                showReminder={showReminder}
            />
            <Workspace
                step={step}
                visitedStep={visited}
                onComplete={doComplete}
                saveTrigger={saveTrigger}
                onSkip={doSkip}
                onSaveRemind={doSaveRemind}
            />
            <nav
                className={visited < 1 ? style.stepButton : style.stepButtonHidden}
                aria-label={t<string>('stepper.aria.step')}
            >
                <Fab
                    variant="extended"
                    color="secondary"
                    disabled={allowedStep < 1}
                    onClick={nextStep}
                    aria-hidden={visited >= 1}
                    data-testid="next-step"
                >
                    {t('stepper.actions.next')}
                    <ArrowForwardIosIcon />
                </Fab>
            </nav>
        </ThemeProvider>
    );
}
