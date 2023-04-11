import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import detector from 'i18next-browser-languagedetector';

i18n.on('languageChanged', (lng) => {
    document.documentElement.setAttribute('lang', lng);
});

i18n.use(detector)
    .use(Backend)
    .use(initReactI18next) // passes i18n down to react-i18next
    .init({
        ns: [],
        backend: {
            loadPath: '/locales/{{lng}}/{{ns}}.json',
        },
        interpolation: {
            escapeValue: false, // react already safes from xss
        },
        fallbackLng: 'en-GB',
    });

export default i18n;
