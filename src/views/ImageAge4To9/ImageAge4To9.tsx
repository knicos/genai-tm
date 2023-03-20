import React, { useState } from "react";
import style from "./stepper.module.css";
import { useTranslation } from "react-i18next";
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import IconButton from "@mui/material/IconButton";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import AppBar from "../../components/AppBar/AppBar";
import Workspace from "../../components/ImageWorkspace/Workspace";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import colours from "../../style/colours.module.css";
import { IVariantContext, VariantContext } from "../../util/variant";
import _settings from "./settings.json";

const settings = _settings as IVariantContext;

const isTest = global?.process?.env?.NODE_ENV === "test";

const theme = createTheme({
    palette: {
        primary: {
            main: (isTest) ? "#fff" : colours.primary,
        },
    },
    typography: {
        fontFamily: [
          'Andika',
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

export function Component() {
    const {t} = useTranslation("image_4_9");
    const [step, setStep] = useState(0);
    const [allowedStep, setAllowedStep] = useState(0);
    const [visited, setVisited] = useState(0);

    return <ThemeProvider theme={theme}>
        <VariantContext.Provider value={settings}>
            <AppBar />
            <Workspace step={step} visitedStep={visited} onComplete={(newstep: number) => {
                setAllowedStep((old: number) => Math.max(old, newstep));
            }} />
            <div className={style.fixed}>
                <IconButton disabled={step <= 0} size="large" onClick={() => setStep(step - 1)}>
                    <ArrowBackIosIcon fontSize="large" />
                </IconButton>
                <Stepper activeStep={step} >
                    <Step>
                        <StepLabel>{t("stepper.labels.createModel")}</StepLabel>
                    </Step>
                    <Step disabled={allowedStep < 1}>
                        <StepLabel>{t("stepper.labels.deployModel")}</StepLabel>
                    </Step>
                </Stepper>
                <IconButton disabled={step >= 1 || allowedStep <= step} size="large" onClick={() => {
                    setStep(step + 1);
                    setVisited((oldVisited) => Math.max(oldVisited, step + 1));
                }}>
                    <ArrowForwardIosIcon fontSize="large"/>
                </IconButton>
            </div>
        </VariantContext.Provider>
    </ThemeProvider>;
}
