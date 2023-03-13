import React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import './App.css';
import { RecoilRoot } from 'recoil';
import { TeachableMachine } from './views/TeachableMachine/TeachableMachine';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import { useTranslation } from 'react-i18next';


const theme = createTheme({
    palette: {
        primary: {
            main: "#008297",
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

function App() {
    const {t} = useTranslation();
    return (
    <RecoilRoot>
        <ThemeProvider theme={theme}>
            <AppBar component="nav" className="AppBar" position="static">
                <Toolbar>
                    <h1>
                        {t("app.title")}
                    </h1>
                <Button color="inherit">{t("app.about")}</Button>
                </Toolbar>
            </AppBar>
            <TeachableMachine />
        </ThemeProvider>
    </RecoilRoot>
    );
}

export default App;
