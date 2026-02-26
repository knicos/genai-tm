import { useEffect, useState } from 'react';

function getOrientation(): 'portrait' | 'landscape' {
    if (screen.orientation) {
        return screen.orientation.type.startsWith('portrait') ? 'portrait' : 'landscape';
    } else {
        return window.innerHeight >= window.innerWidth ? 'portrait' : 'landscape';
    }
}

export default function useOrientation(): 'portrait' | 'landscape' {
    const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(getOrientation());

    useEffect(() => {
        const handleOrientationChange = () => {
            const newOrientation = getOrientation();
            setOrientation(newOrientation);
        };

        if (screen.orientation) {
            screen.orientation.addEventListener('change', handleOrientationChange);

            return () => {
                screen.orientation.removeEventListener('change', handleOrientationChange);
            };
        } else {
            window.addEventListener('resize', handleOrientationChange);

            return () => {
                window.removeEventListener('resize', handleOrientationChange);
            };
        }
    }, []);

    return orientation;
}
