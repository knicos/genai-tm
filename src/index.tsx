import React from 'react';
import ReactDOM from 'react-dom/client';
import './i18n';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import smoothscroll from 'smoothscroll-polyfill';

smoothscroll.polyfill();

// Suppress harmless video playback interruption errors
window.addEventListener('unhandledrejection', (event) => {
    if (event.reason?.name === 'AbortError' && 
        event.reason?.message?.includes('play() request was interrupted')) {
        // Suppress: Video playback interrupted (happens during webcam switching)
        event.preventDefault();
    }
});

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
