import { describe, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import ShareProtocol from './ShareProtocol';
import TestWrapper from '@genaitm/util/TestWrapper';
import { createStore } from 'jotai';
import { modelShared, modelState, sessionCode, shareModel } from '@genaitm/state';
import { TeachableModel } from '@genai-fi/classifier';
import RecoilObserver from '@genaitm/util/Observer';

describe('ShareProtocol', () => {
    it('should post the model when sharing', async ({ expect }) => {
        const store = createStore();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const model = {
            ready: vi.fn(async () => true),
            isTrained: vi.fn(() => false),
            getVariant: vi.fn(() => 'image'),
            getImageSize: vi.fn(() => 224),
            getLabels: vi.fn(() => ['class1', 'class2']),
            save: vi.fn(() => Promise.resolve(new Blob())),
            getMetadata: vi.fn(() => ({
                imageSize: 224,
            })),
            addExample: vi.fn(),
            train: vi.fn(),
        } as unknown as TeachableModel;
        store.set(modelState, model);
        store.set(sessionCode, 'test-session');

        vi.stubEnv('VITE_APP_API', 'http://localhost:9001');

        // Mock the fetch API
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                statusText: 'OK',
            } as Response)
        ) as unknown as typeof fetch;

        render(
            <TestWrapper initializeState={store}>
                <ShareProtocol />
            </TestWrapper>
        );

        store.set(shareModel, true);

        // Wait for the fetch to be called
        await vi.waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                `http://localhost:9001/model/test-session/`,
                expect.objectContaining({
                    method: 'POST',
                    body: expect.any(Blob),
                })
            );
        });
    });

    it('should set state on failure', async ({ expect }) => {
        const store = createStore();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const model = {
            ready: vi.fn(async () => true),
            isTrained: vi.fn(() => false),
            getVariant: vi.fn(() => 'image'),
            getImageSize: vi.fn(() => 224),
            getLabels: vi.fn(() => ['class1', 'class2']),
            save: vi.fn(() => Promise.resolve(new Blob())),
            getMetadata: vi.fn(() => ({
                imageSize: 224,
            })),
            addExample: vi.fn(),
            train: vi.fn(),
        } as unknown as TeachableModel;

        store.set(modelState, model);
        store.set(sessionCode, 'test-session');

        vi.stubEnv('VITE_APP_API', 'http://localhost:9001');

        // Mock the fetch API
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: false,
                statusText: 'Internal Server Error',
                status: 500,
            } as Response)
        ) as unknown as typeof fetch;

        const changeFn = vi.fn();

        render(
            <TestWrapper initializeState={store}>
                <ShareProtocol />
                <RecoilObserver
                    node={modelShared}
                    onChange={changeFn}
                />
            </TestWrapper>
        );

        store.set(shareModel, true);

        // Wait for the fetch to be called
        await vi.waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                `http://localhost:9001/model/test-session/`,
                expect.objectContaining({
                    method: 'POST',
                    body: expect.any(Blob),
                })
            );
        });

        expect(changeFn).toHaveBeenCalledWith(false);
    });
});
