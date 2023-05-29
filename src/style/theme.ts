import { createTheme } from '@mui/material/styles';
import colours from './colours.module.css';

const isTest = global?.process?.env?.NODE_ENV === 'test';

export const theme = createTheme({
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
