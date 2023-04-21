import React, { useState, useCallback } from 'react';
import style from './stepper.module.css';
import { useTranslation } from 'react-i18next';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import IconButton from '@mui/material/IconButton';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import AppBar from '../../components/AppBar/AppBar';
import Workspace from '../../components/ImageWorkspace/Workspace';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import colours from '../../style/colours.module.css';
import { useVariant } from '../../util/variant';
import Fab from '@mui/material/Fab';

const isTest = global?.process?.env?.NODE_ENV === 'test';

const theme = createTheme({
    palette: {
        primary: {
            main: isTest ? '#fff' : colours.primary,
        },
        success: {
            main: '#00972e',
        },
    },
    typography: {
        fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
            '"Apple Color Emoji"',
            '"Segoe UI Emoji"',
            '"Segoe UI Symbol"',
        ].join(','),
    },
});

export default function ImageClassifier() {
    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);
    const [step, setStep] = useState(0);
    const [allowedStep, setAllowedStep] = useState(0);
    const [visited, setVisited] = useState(0);
    const [saveTrigger, setSaveTrigger] = useState<(() => void) | undefined>(undefined);

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

    const nextStep = useCallback(() => {
        setStep(step + 1);
        setVisited((oldVisited) => Math.max(oldVisited, step + 1));
    }, [setStep, setVisited, step]);

    const doSave = useCallback(() => setSaveTrigger(() => () => setSaveTrigger(undefined)), [setSaveTrigger]);

    return (
        <ThemeProvider theme={theme}>
            <AppBar onSave={doSave} />
            <Workspace
                step={step}
                visitedStep={visited}
                onComplete={doComplete}
                saveTrigger={saveTrigger}
                onSkip={doSkip}
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
