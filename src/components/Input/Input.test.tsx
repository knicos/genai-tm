import { describe, it, vi } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Input from './Input';
import TestWrapper from '../../util/TestWrapper';
import RecoilObserver from '../../util/Observer';
import { prediction, predictedIndex, modelState } from '../../state';
import { TeachableModel } from '@genai-fi/classifier';
import { createStore } from 'jotai';

vi.mock('@genai-fi/base', async (importOriginal) => ({
    ...(await importOriginal<typeof import('@genai-fi/base')>()),
    Webcam: function ({
        onCapture,
        onPostprocess,
    }: {
        onCapture: (img: HTMLCanvasElement) => void;
        onPostprocess: (img: HTMLCanvasElement) => void;
    }) {
        setTimeout(() => {
            const canvas = document.createElement('canvas');
            canvas.width = 224;
            canvas.height = 224;
            onCapture(canvas);
            onPostprocess(canvas);
        }, 10);
        return <div data-testid="webcam"></div>;
    },
}));

describe('Input component', () => {
    it('renders', async ({ expect }) => {
        render(<Input />, { wrapper: TestWrapper });
        expect(screen.getByTestId('widget-input.labels.title')).toBeInTheDocument();
    });

    it('can do predictions', async ({ expect }) => {
        const onPredict = vi.fn();

        const model = {
            predict: vi.fn(() => {
                return { predictions: [{ className: 'Class 1', probability: 0.1 }] };
            }),
            isTrained: vi.fn(() => true),
            getImageSize: vi.fn(() => 224),
            getVariant: vi.fn(() => 'image'),
            getLabels: vi.fn(() => ['Class 1']),
            estimate: vi.fn(),
            draw: vi.fn(),
        } as unknown as TeachableModel;

        const store = createStore();
        store.set(modelState, model);
        store.set(predictedIndex, -1);

        function ModelWrapper({ children }: React.PropsWithChildren) {
            return <TestWrapper initializeState={store}>{children}</TestWrapper>;
        }

        render(
            <>
                <RecoilObserver
                    node={prediction}
                    onChange={onPredict}
                />
                <Input />
            </>,
            { wrapper: ModelWrapper }
        );

        await waitFor(() => expect(model.predict).toHaveBeenCalled());
        expect(screen.getByTestId('webcam')).toBeInTheDocument();
        expect(onPredict).toHaveBeenCalledWith([{ className: 'Class 1', probability: 0.1 }]);
    });

    it('can select the best prediction', async ({ expect }) => {
        const onPredict = vi.fn();

        const model = {
            predict: vi.fn(() => ({
                predictions: [
                    { className: 'Class 1', probability: 0.1 },
                    { className: 'Class 2', probability: 0.2 },
                    { className: 'Class 3', probability: 0.12 },
                    { className: 'Class 4', probability: 0.02 },
                    { className: 'Class 5', probability: 0.199 },
                ],
            })),
            isTrained: vi.fn(() => true),
            getImageSize: vi.fn(() => 224),
            getVariant: vi.fn(() => 'image'),
            getLabels: vi.fn(() => ['Class 1']),
            estimate: vi.fn(),
            draw: vi.fn(),
        } as unknown as TeachableModel;

        const store = createStore();
        store.set(modelState, model);
        store.set(predictedIndex, -1);

        function ModelWrapper({ children }: React.PropsWithChildren) {
            return <TestWrapper initializeState={store}>{children}</TestWrapper>;
        }

        render(
            <>
                <RecoilObserver
                    node={predictedIndex}
                    onChange={onPredict}
                />
                <Input />
            </>,
            { wrapper: ModelWrapper }
        );

        await waitFor(() => expect(model.predict).toHaveBeenCalled());
        expect(onPredict).toHaveBeenCalledWith(1);
    });
});
