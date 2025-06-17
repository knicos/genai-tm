import { describe, it } from 'vitest';
import { BehaviourType } from './Behaviours';
import { patchBehaviours } from './patch';

describe('Behaviour patch', () => {
    it('can work without labels', async ({ expect }) => {
        const behaviors = [{ text: { text: 'b1' } }, { text: { text: 'b2' } }] as BehaviourType[];
        const classes = ['c1', 'c2'];

        const result = patchBehaviours(behaviors, classes);

        expect(result).toHaveLength(2);
        expect(result[0].label).toBe('c1');
        expect(result[1].label).toBe('c2');
        expect(result[0].text?.text).toBe('b1');
        expect(result[1].text?.text).toBe('b2');
    });

    it('keeps perfect order if no name changes', async ({ expect }) => {
        const behaviors = [
            { label: 'c1', text: { text: 'b1' } },
            { label: 'c2', text: { text: 'b2' } },
        ] as BehaviourType[];
        const classes = ['c1', 'c2'];

        const result = patchBehaviours(behaviors, classes);

        expect(result).toHaveLength(2);
        expect(result[0]).toBe(behaviors[0]);
        expect(result[1]).toBe(behaviors[1]);
    });

    it('can swap in names are swapped', async ({ expect }) => {
        const behaviors = [
            { label: 'c1', text: { text: 'b1' } },
            { label: 'c2', text: { text: 'b2' } },
        ] as BehaviourType[];
        const classes = ['c2', 'c1'];

        const result = patchBehaviours(behaviors, classes);

        expect(result).toHaveLength(2);
        expect(result[0]).toBe(behaviors[1]);
        expect(result[1]).toBe(behaviors[0]);
    });

    it('allows one class to be renamed', async ({ expect }) => {
        const behaviors = [
            { label: 'c1', text: { text: 'b1' } },
            { label: 'c2', text: { text: 'b2' } },
            { label: 'c3', text: { text: 'b3' } },
        ] as BehaviourType[];
        const classes = ['c1', 'cX', 'c3'];

        const result = patchBehaviours(behaviors, classes);

        expect(result).toHaveLength(3);
        expect(result[0]).toBe(behaviors[0]);
        expect(result[1].label).toBe('cX');
        expect(result[1].text?.text).toBe('b2');
        expect(result[2]).toBe(behaviors[2]);
    });

    it('allows two classes to be renamed', async ({ expect }) => {
        const behaviors = [
            { label: 'c1', text: { text: 'b1' } },
            { label: 'c2', text: { text: 'b2' } },
            { label: 'c3', text: { text: 'b3' } },
        ] as BehaviourType[];
        const classes = ['c1', 'cX', 'cY'];

        const result = patchBehaviours(behaviors, classes);

        expect(result).toHaveLength(3);
        expect(result[0]).toBe(behaviors[0]);
        expect(result[1].label).toBe('cX');
        expect(result[1].text?.text).toBe('b2');
        expect(result[2].label).toBe('cY');
        expect(result[2].text?.text).toBe('b3');
    });

    it('allows a middle class to be removed', async ({ expect }) => {
        const behaviors = [
            { label: 'c1', text: { text: 'b1' } },
            { label: 'c2', text: { text: 'b2' } },
            { label: 'c3', text: { text: 'b3' } },
        ] as BehaviourType[];
        const classes = ['c1', 'c3'];

        const result = patchBehaviours(behaviors, classes);

        expect(result).toHaveLength(2);
        expect(result[0]).toBe(behaviors[0]);
        expect(result[1]).toBe(behaviors[2]);
    });

    it('allows a front class to be removed', async ({ expect }) => {
        const behaviors = [
            { label: 'c1', text: { text: 'b1' } },
            { label: 'c2', text: { text: 'b2' } },
            { label: 'c3', text: { text: 'b3' } },
        ] as BehaviourType[];
        const classes = ['c2', 'c3'];

        const result = patchBehaviours(behaviors, classes);

        expect(result).toHaveLength(2);
        expect(result[0]).toBe(behaviors[1]);
        expect(result[1]).toBe(behaviors[2]);
    });

    it('allows a back class to be removed', async ({ expect }) => {
        const behaviors = [
            { label: 'c1', text: { text: 'b1' } },
            { label: 'c2', text: { text: 'b2' } },
            { label: 'c3', text: { text: 'b3' } },
        ] as BehaviourType[];
        const classes = ['c1', 'c2'];

        const result = patchBehaviours(behaviors, classes);

        expect(result).toHaveLength(2);
        expect(result[0]).toBe(behaviors[0]);
        expect(result[1]).toBe(behaviors[1]);
    });

    it('allows a class to be added', async ({ expect }) => {
        const behaviors = [
            { label: 'c1', text: { text: 'b1' } },
            { label: 'c2', text: { text: 'b2' } },
            { label: 'c3', text: { text: 'b3' } },
        ] as BehaviourType[];
        const classes = ['c1', 'c2', 'c3', 'c4'];

        const result = patchBehaviours(behaviors, classes);

        expect(result).toHaveLength(4);
        expect(result[0]).toBe(behaviors[0]);
        expect(result[1]).toBe(behaviors[1]);
        expect(result[2]).toBe(behaviors[2]);
    });

    it('handles duplicate labels', async ({ expect }) => {
        const behaviors = [
            { label: 'c1', text: { text: 'b1' } },
            { label: 'c2', text: { text: 'b2' } },
            { label: 'c1', text: { text: 'b3' } },
        ] as BehaviourType[];
        const classes = ['c1', 'c2', 'c1'];

        const result = patchBehaviours(behaviors, classes);

        expect(result).toHaveLength(3);
        expect(result[0]).toBe(behaviors[0]);
        expect(result[1]).toBe(behaviors[1]);
        expect(result[2]).toBe(behaviors[2]);
    });

    it('handles new duplicate labels', async ({ expect }) => {
        const behaviors = [
            { label: 'c1', text: { text: 'b1' } },
            { label: 'c2', text: { text: 'b2' } },
            { label: 'c1', text: { text: 'b3' } },
        ] as BehaviourType[];
        const classes = ['c1', 'c2', 'c1', 'c1'];

        const result = patchBehaviours(behaviors, classes);

        expect(result).toHaveLength(4);
        expect(result[0]).toBe(behaviors[0]);
        expect(result[1]).toBe(behaviors[1]);
        expect(result[2]).toBe(behaviors[2]);
        expect(result[3]).toEqual({ label: 'c1', text: { text: 'c1' } });
    });
});
