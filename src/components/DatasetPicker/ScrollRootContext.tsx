import { createContext, useContext, useState, useCallback, type RefCallback } from 'react';

/**
 * Provides the scrollable container element (e.g. MUI DialogContent) as the
 * IntersectionObserver root so that lazy image loading inside an overflow
 * scroll container works correctly.
 */
const ScrollRootContext = createContext<HTMLElement | null>(null);

export const useScrollRoot = () => useContext(ScrollRootContext);

export { ScrollRootContext };

export function useScrollRootRef(): [HTMLElement | null, RefCallback<HTMLElement>] {
    const [root, setRoot] = useState<HTMLElement | null>(null);
    const ref = useCallback((el: HTMLElement | null) => {
        setRoot(el);
    }, []);
    return [root, ref];
}
