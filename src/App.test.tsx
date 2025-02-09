import { it, describe } from 'vitest';
import { render, screen } from '@testing-library/react';
import App, { routes } from './App';
import { createMemoryRouter } from 'react-router-dom';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next) // passes i18n down to react-i18next
    .init({
        ns: [],
        interpolation: {
            escapeValue: false, // react already safes from xss
        },
        fallbackLng: 'en-GB',
        supportedLngs: ['en-GB'],
        resources: {
            'en-GB': {
                translation: {
                    about: {
                        privacy: ['#About page'],
                    },
                },
            },
        },
    });

describe('Integration', () => {
    it('renders image app', async ({ expect }) => {
        const memRouter = createMemoryRouter(routes, { initialEntries: ['/image/general'] });
        render(<App router={memRouter} />);
        expect(await screen.findByTestId('versionlink', undefined, { timeout: 10000 })).toBeInTheDocument();
    });

    it('renders about page', async ({ expect }) => {
        const memRouter = createMemoryRouter(routes, { initialEntries: ['/about'] });
        render(<App router={memRouter} />);
        expect(await screen.findByTestId('about-main', undefined, { timeout: 2000 })).toBeInTheDocument();
    });
});
