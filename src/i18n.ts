import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import Backend from 'i18next-http-backend';
import detector from 'i18next-browser-languagedetector';

i18n.on('languageChanged', (lng) => {
    document.documentElement.setAttribute('lang', lng);
});

i18n.use(detector)
    .use(Backend)
    .use(initReactI18next)
    .init({
        ns: [], // empty because namespaces are loaded on demand
        backend: {
            loadPath: '/locales/{{lng}}/{{ns}}.json',
        },
        interpolation: {
            escapeValue: false,
        },
        fallbackLng: 'en-GB',
        supportedLngs: [
            'de-DE',
            'en-GB',
            'fi-FI',
            'ja-JP',
            'kr-KR',
            'krl-FI',
            'sv',
            'pt-BR',
            'ru-RU',
            'tr-TR',
            'ua-UA',
            'sw',
            'si-LK' // ✅ Add Sinhala here
        ],
        detection: {
            caches: [],
        },
    });

export default i18n;
