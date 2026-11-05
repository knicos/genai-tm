import { describe, it, vi, beforeEach, afterEach } from 'vitest';
import { act, render } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import i18next, { i18n as I18n } from 'i18next';
import { useTranslation } from 'react-i18next';
import { useLanguageQuery } from './useLanguageQuery';

vi.mock('react-i18next', () => ({
    useTranslation: vi.fn(),
}));

function Probe() {
    useLanguageQuery();
    return null;
}

async function createI18n(lng?: string) {
    const instance = i18next.createInstance();
    await instance.init({
        lng,
        fallbackLng: 'en-GB',
        supportedLngs: ['en-GB', 'fi-FI', 'de-DE'],
        resources: {},
    });
    return instance;
}

function setup(i18n: I18n, url: string) {
    vi.mocked(useTranslation).mockReturnValue({ i18n } as unknown as ReturnType<typeof useTranslation>);
    const router = createMemoryRouter([{ path: '/*', element: <Probe /> }], { initialEntries: [url] });
    render(<RouterProvider router={router} />);
    return router;
}

describe('useLanguageQuery', () => {
    beforeEach(() => {
        vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['en-GB']);
        vi.spyOn(navigator, 'language', 'get').mockReturnValue('en-GB');
    });
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('does not add a parameter for the device default language', async ({ expect }) => {
        const i18n = await createI18n('en-GB');
        const router = setup(i18n, '/home?x=1');
        expect(router.state.location.search).toBe('?x=1');
    });

    it('sets the parameter when the language changes away from the default', async ({ expect }) => {
        const i18n = await createI18n('en-GB');
        const router = setup(i18n, '/image/general?x=1#h');
        await act(async () => {
            await i18n.changeLanguage('fi-FI');
        });
        expect(router.state.location.pathname).toBe('/image/general');
        expect(router.state.location.search).toBe('?x=1&lng=fi-FI');
        expect(router.state.location.hash).toBe('#h');
    });

    it('removes the parameter when changing back to the default', async ({ expect }) => {
        const i18n = await createI18n('fi-FI');
        const router = setup(i18n, '/home?lng=fi-FI');
        await act(async () => {
            await i18n.changeLanguage('en-GB');
        });
        expect(router.state.location.search).toBe('');
    });

    it('changes language from the URL parameter', async ({ expect }) => {
        const i18n = await createI18n('en-GB');
        const router = setup(i18n, '/home');
        await act(async () => {
            await router.navigate('/about?lng=de-DE');
        });
        expect(i18n.language).toBe('de-DE');
        expect(router.state.location.search).toBe('?lng=de-DE');
    });

    it('keeps the parameter when navigation drops it', async ({ expect }) => {
        const i18n = await createI18n('fi-FI');
        const router = setup(i18n, '/home?lng=fi-FI');
        await act(async () => {
            await router.navigate('/about');
        });
        expect(i18n.language).toBe('fi-FI');
        expect(router.state.location.search).toBe('?lng=fi-FI');
    });

    it('removes unsupported language parameters', async ({ expect }) => {
        const i18n = await createI18n('en-GB');
        const router = setup(i18n, '/home?lng=xx-XX');
        expect(i18n.language).toBe('en-GB');
        expect(router.state.location.search).toBe('');
    });
});
