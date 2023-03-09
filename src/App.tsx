import React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import './App.css';
import { RecoilRoot } from 'recoil';
import { TeachableMachine } from './views/TeachableMachine/TeachableMachine';

const theme = createTheme({
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
            <TeachableMachine />
        </ThemeProvider>
    </RecoilRoot>
  );
}

export default App;
