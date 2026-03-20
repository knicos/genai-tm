import { useState, useCallback, useEffect, useRef } from 'react';
import style from './stepper.module.css';
import { useTranslation } from 'react-i18next';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import AppBar from '../../components/AppBar/AppBar';
import Workspace from '../../workflow/ImageWorkspace/Workspace';
import { ThemeProvider } from '@mui/material/styles';
import { useVariant } from '../../util/variant';
import Fab from '@mui/material/Fab';
import { theme } from '@genai-fi/base';
import SettingsDialog from '../SettingsDialog/SettingsDialog';
import { useSetAtom } from 'jotai';
import { feedbackAtom } from '@genaitm/state';

export default function ImageClassifier() {
    const { namespace, modelVariant } = useVariant();
    const { t } = useTranslation(namespace);
    const [step, setStep] = useState(0);
    const [allowedStep, setAllowedStep] = useState(0);
    const [visited, setVisited] = useState(0);
    const [saveTrigger, setSaveTrigger] = useState<(() => void) | undefined>(undefined);
    const [showReminder, setShowReminder] = useState(false);
    const lastVariantRef = useRef(modelVariant);
    const setFeedback = useSetAtom(feedbackAtom);

    // Reset stepper to default state when model variant changes
    useEffect(() => {
        if (lastVariantRef.current !== modelVariant) {
            setStep(0);
            setAllowedStep(0);
            setVisited(0);
            lastVariantRef.current = modelVariant;
        }
    }, [modelVariant]);

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
        setFeedback(true);
        setStep(step + 1);
        setVisited((oldVisited) => Math.max(oldVisited, step + 1));
    }, [setStep, setVisited, step, setFeedback]);

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
            <SettingsDialog />
            <nav
                className={visited < 1 ? style.stepButton : style.stepButtonHidden}
                aria-label={t('stepper.aria.step')}
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
