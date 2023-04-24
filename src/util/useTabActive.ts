import { useEffect, useState } from 'react';

export function useTabActive() {
    const [active, setActive] = useState(true);
    useEffect(() => {
        const doWindowBlur = () => {
            setActive(false);
        };
        const doWindowFocus = () => {
            setActive(true);
        };
        window.addEventListener('blur', doWindowBlur);
        window.addEventListener('focus', doWindowFocus);
        return () => {
            window.removeEventListener('blur', doWindowBlur);
            window.removeEventListener('focus', doWindowFocus);
        };
    }, [setActive]);
    return active;
}
