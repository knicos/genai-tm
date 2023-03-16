import React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import './App.css';
import { RecoilRoot } from 'recoil';
import { TeachableMachine } from './views/TeachableMachine/TeachableMachine';
import Home from "./views/Home/Home";
import colours from "./style/colours.module.css";
import { Routes, Route, Navigate } from 'react-router-dom';

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

function App() {
    return (
    <RecoilRoot>
        <ThemeProvider theme={theme}>
            <Routes>
                <Route path="/">
                    <Route index element={<Navigate replace to="/image" />} />
                    <Route path="image?/:variant" element={<TeachableMachine />} />
                    <Route path="home" element={<Home />} />
                </Route>
            </Routes>
        </ThemeProvider>
    </RecoilRoot>
    );
}

export default App;
