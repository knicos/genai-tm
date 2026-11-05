import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import type { i18n as I18n } from 'i18next';

// Matches the default `lookupQuerystring` of i18next-browser-languagedetector.
export const LANGUAGE_QUERY_PARAM = 'lng';

export function getDeviceLanguage(i18n: I18n): string | undefined {
    const utils = i18n.services?.languageUtils;
    if (!utils || typeof navigator === 'undefined') return undefined;
    const codes = [...(navigator.languages || []), navigator.language].filter(Boolean);
    return utils.getBestMatchFromCodes(codes);
}

function isSupported(i18n: I18n, lng: string) {
    const utils = i18n.services?.languageUtils;
    return utils ? utils.isSupportedCode(lng) : true;
}

/**
 * Keeps the i18n language and the `lng` URL query parameter in sync. A `lng` parameter in the URL
 * selects the language, and changing the language updates the URL. The parameter is omitted when
 * the language matches the device default.
 */
export function useLanguageQuery() {
    const { i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const subscribe = useCallback(
        (onChange: () => void) => {
            if (!i18n.on) return () => {};
            i18n.on('languageChanged', onChange);
            return () => i18n.off?.('languageChanged', onChange);
        },
        [i18n]
    );
    const language = useSyncExternalStore(subscribe, () => i18n.language as string | undefined);
    const prevParam = useRef<string | null | undefined>(undefined);

    useEffect(() => {
        if (!language) return;

        const params = new URLSearchParams(location.search);
        const param = params.get(LANGUAGE_QUERY_PARAM);
        const paramChanged = param !== prevParam.current;
        prevParam.current = param;

        // URL changed to request a different language.
        if (paramChanged && param && param !== language && isSupported(i18n, param)) {
            i18n.changeLanguage(param);
            return;
        }

        const desired = language === getDeviceLanguage(i18n) ? null : language;
        if (desired === param) return;

        if (desired) {
            params.set(LANGUAGE_QUERY_PARAM, desired);
        } else {
            params.delete(LANGUAGE_QUERY_PARAM);
        }
        const search = params.toString();
        navigate(
            { pathname: location.pathname, search: search ? `?${search}` : '', hash: location.hash },
            { replace: true, state: location.state }
        );
    }, [language, location.search, location.pathname, location.hash, location.state, navigate, i18n]);
}
