import { describe, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TestWrapper from '../../util/TestWrapper';
import ApplicationBar from './AppBar';
import { useTranslation } from 'react-i18next';
import userEvent from '@testing-library/user-event';

vi.mock('react-i18next', () => ({
    useTranslation: vi.fn(),
    initReactI18next: {
        type: '3rdParty',
        init: () => {},
    },
}));

describe('AppBar component', () => {
    it('renders with all elements', async ({ expect }) => {
        const saveFn = vi.fn();

        const useTranslationSpy = useTranslation as ReturnType<typeof vi.fn>;
        useTranslationSpy.mockImplementation(() => ({ t: (str: string) => str, i18n: {} }));

        render(<ApplicationBar onSave={saveFn} />, { wrapper: TestWrapper });
        expect(screen.getByTestId('open-project')).toBeInTheDocument();
        expect(screen.getByTestId('save-project')).toBeInTheDocument();
        expect(screen.getByText('English')).toBeInTheDocument();
        expect(screen.getByText('app.title')).toBeInTheDocument();
    });

    it('can change language', async ({ expect }) => {
        const saveFn = vi.fn();
        const changeLangFn = vi.fn();
        const user = userEvent.setup();

        const useTranslationSpy = useTranslation as ReturnType<typeof vi.fn>;
        useTranslationSpy.mockReturnValue({
            t: (str: string) => str,
            i18n: {
                changeLanguage: changeLangFn,
            },
        });

        render(<ApplicationBar onSave={saveFn} />, { wrapper: TestWrapper });

        const buttonElement = screen.getByLabelText('app.language');
        await user.selectOptions(buttonElement, 'fi-FI');
        expect(changeLangFn).toHaveBeenCalledWith('fi-FI');
    });
});
