import { activeNodes } from '@genaitm/state';
import { useEffect } from 'react';
import { useSetRecoilState } from 'recoil';

export function useActiveNode(id: string, state: boolean | number) {
    const setActive = useSetRecoilState(activeNodes);

    useEffect(() => {
        setActive((old) => {
            const nset = new Set(old);
            if (state) nset.add(id);
            else nset.delete(id);
            return nset;
        });
    }, [id, state]);
}
