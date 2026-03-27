import { useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { Atom } from 'jotai';

interface Props<T> {
    node: Atom<T>;
    onChange: (value: T) => void;
}

export default function RecoilObserver<T>({ node, onChange }: Props<T>) {
    const value = useAtomValue(node);
    useEffect(() => onChange(value), [onChange, value]);
    return null;
}
