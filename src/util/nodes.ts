import { activeNodes } from '@genaitm/state';
import { useEffect } from 'react';
import { useSetAtom } from 'jotai';

export function useActiveNode(id: string, state: boolean | number) {
    const setActive = useSetAtom(activeNodes);

    useEffect(() => {
        setActive((old) => {
            const nset = new Set(old);
            if (state) nset.add(id);
            else nset.delete(id);
            return nset;
        });
    }, [id, state]);
}
