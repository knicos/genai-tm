import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { usePretrainedClassMapViewport } from './usePretrainedClassMapViewport';

afterEach(() => vi.unstubAllGlobals());

describe('Class map viewport', () => {
    it('applies the initial readable zoom when the dialog surface mounts after opening', () => {
        vi.stubGlobal('matchMedia', () => ({ matches: false }));
        const layout = { columns: 32, width: 980, height: 980 };
        const { result } = renderHook(() =>
            usePretrainedClassMapViewport({
                active: true,
                items: [],
                layout,
                onSelectClass: vi.fn(),
            })
        );

        expect(result.current.view.zoom).toBe(1);
        const surface = document.createElement('div');
        vi.spyOn(surface, 'getBoundingClientRect').mockReturnValue({
            width: 600,
            height: 600,
        } as DOMRect);

        act(() => result.current.panSurfaceRef(surface));
        expect(result.current.view.zoom).toBeGreaterThan(1);
        expect(result.current.view.pan.x).toBe(0);
        expect(result.current.view.pan.y).toBe(0);
    });
});
