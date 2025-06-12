import { useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { Atom } from 'jotai';

interface Props {
    node: Atom<unknown>;
    onChange: (value: unknown) => void;
}

export default function RecoilObserver({ node, onChange }: Props) {
    const value = useAtomValue(node);
    useEffect(() => onChange(value), [onChange, value]);
    return null;
}
