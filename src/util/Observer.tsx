import { useEffect } from 'react';
import { useRecoilValue, RecoilValue } from 'recoil';

interface Props {
    node: RecoilValue<unknown>;
    onChange: (value: unknown) => void;
}

export default function RecoilObserver({ node, onChange }: Props) {
    const value = useRecoilValue(node);
    useEffect(() => onChange(value), [onChange, value]);
    return null;
}
