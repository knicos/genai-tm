import React from 'react';
import { render, screen } from '@testing-library/react';
import TestWrapper from '../../util/TestWrapper';
import ApplicationBar from './AppBar';
import { useTranslation } from 'react-i18next';
import userEvent from '@testing-library/user-event';

jest.mock('react-i18next', () => ({
    useTranslation: jest.fn(),
    initReactI18next: {
        type: '3rdParty',
        init: () => {},
    },
}));

describe('AppBar component', () => {
    it('renders with all elements', async () => {
        const saveFn = jest.fn();

        const useTranslationSpy = useTranslation as ReturnType<typeof jest.fn>;
        useTranslationSpy.mockImplementation(() => ({ t: (str: string) => str, i18n: {} }));

        render(<ApplicationBar onSave={saveFn} />, { wrapper: TestWrapper });
        expect(screen.getByTestId('open-project')).toBeInTheDocument();
        expect(screen.getByTestId('save-project')).toBeInTheDocument();
        expect(screen.getByTestId('lang-en-GB')).toBeInTheDocument();
        expect(screen.getByTestId('lang-fi-FI')).toBeInTheDocument();
        expect(screen.getByText('app.title')).toBeInTheDocument();
    });

    it('can change language', async () => {
        const saveFn = jest.fn();
        const changeLangFn = jest.fn();
        const user = userEvent.setup();

        const useTranslationSpy = useTranslation as ReturnType<typeof jest.fn>;
        useTranslationSpy.mockReturnValue({
            t: (str: string) => str,
            i18n: {
                changeLanguage: changeLangFn,
            },
        });

        render(<ApplicationBar onSave={saveFn} />, { wrapper: TestWrapper });

        const buttonElement = screen.getByTestId('lang-fi-FI');
        await user.click(buttonElement);
        expect(changeLangFn).toHaveBeenCalledWith('fi-FI');
    });
});
