import { BehaviourType } from './Behaviours';

export function patchBehaviours(old: BehaviourType[], classes: string[]): BehaviourType[] {
    if (old.length === 0 && classes.length === 0) return old;
    if (classes.length === 0) return old;

    const classSet = new Set(classes);
    const unmapped: BehaviourType[] = [];

    const mapping = new Map<string, BehaviourType[]>();
    for (const o of old) {
        if (classSet.has(o.label)) {
            if (!mapping.has(o.label)) mapping.set(o.label, []);
            mapping.get(o.label)?.push(o);
        } else {
            unmapped.push(o);
        }
    }

    const result: BehaviourType[] = [];

    for (const c of classes) {
        const items = mapping.get(c);
        const item = items?.shift();
        if (item) {
            result.push(item);
        } else {
            const shifted = unmapped.shift();
            if (shifted) {
                const wasDefaultText = shifted.text?.text === shifted.label;
                result.push({
                    ...shifted,
                    label: c,
                    text: wasDefaultText && shifted.text ? { ...shifted.text, text: c } : shifted.text,
                });
            } else {
                result.push({ label: c, text: { text: c } });
            }
        }
    }

    return result;
}
