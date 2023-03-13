import React from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import './App.css';
import { RecoilRoot } from 'recoil';
import { TeachableMachine } from './views/TeachableMachine/TeachableMachine';
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';


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
  return (
    <RecoilRoot>
        <ThemeProvider theme={theme}>
            <AppBar component="nav" className="AppBar" position="static">
                <Toolbar>
                    <h1>
                        GenAI Image Recogniser
                    </h1>
                <Button color="inherit">About</Button>
                </Toolbar>
            </AppBar>
            <TeachableMachine />
        </ThemeProvider>
    </RecoilRoot>
  );
}

export default App;
