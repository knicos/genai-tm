import { describe, it, vi } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Trainer from './Trainer';
import TestWrapper from '../../util/TestWrapper';
import userEvent from '@testing-library/user-event';
import { classState, modelState } from '../../state';
import { createStore } from 'jotai';
import RecoilObserver from '../../util/Observer';
import { TeachableModel } from '@genai-fi/classifier';

vi.mock('@genai-fi/classifier', () => ({
    TeachableModel: vi.fn(function (this: any) {
        this.setLabels = vi.fn();
        this.setSeed = vi.fn();
        this.addExample = vi.fn();
        this.train = vi.fn(async () => {});
        this.setName = vi.fn();
        this.getMetadata = vi.fn(() => ({}));
        this.ready = vi.fn(async () => true);
        this.isTrained = vi.fn(() => false);
        this.getImageSize = vi.fn(() => 224);
        this.getVariant = vi.fn(() => 'image');
    }),
}));

describe('Trainer component', () => {
    it('shows add more message', async ({ expect }) => {
        const store = createStore();
        store.set(classState, []);

        function PredWrapper({ children }: React.PropsWithChildren) {
            return <TestWrapper initializeState={store}>{children}</TestWrapper>;
        }
        render(<Trainer />, { wrapper: PredWrapper });
        expect(screen.getByTestId('alert-addmore')).toBeVisible();
    });

    it('shows needs training', async ({ expect }) => {
        const store = createStore();
        store.set(classState, [
            {
                label: 'Class 1',
                samples: [
                    { data: document.createElement('canvas'), id: '' },
                    { data: document.createElement('canvas'), id: '' },
                ],
            },
            {
                label: 'Class 2',
                samples: [
                    { data: document.createElement('canvas'), id: '' },
                    { data: document.createElement('canvas'), id: '' },
                ],
            },
        ]);
        function PredWrapper({ children }: React.PropsWithChildren) {
            return <TestWrapper initializeState={store}>{children}</TestWrapper>;
        }
        render(<Trainer />, { wrapper: PredWrapper });
        expect(screen.getByTestId('alert-needstraining')).toBeVisible();
    });

    it('can perform training', async ({ expect }) => {
        const user = userEvent.setup();

        const model = {
            ready: vi.fn(async () => true),
            isTrained: vi.fn(() => false),
            addExample: vi.fn(),
            train: vi.fn(),
            getVariant: vi.fn(() => 'image'),
        } as unknown as TeachableModel;

        const setModel = vi.fn(() => {});

        const store = createStore();
        store.set(modelState, model);
        store.set(classState, [
            {
                label: 'Class 1',
                samples: [
                    { data: document.createElement('canvas'), id: '' },
                    { data: document.createElement('canvas'), id: '' },
                ],
            },
            {
                label: 'Class 2',
                samples: [
                    { data: document.createElement('canvas'), id: '' },
                    { data: document.createElement('canvas'), id: '' },
                ],
            },
        ]);

        function PredWrapper({ children }: React.PropsWithChildren) {
            return <TestWrapper initializeState={store}>{children}</TestWrapper>;
        }
        render(
            <>
                <RecoilObserver
                    node={modelState}
                    onChange={setModel}
                />
                <Trainer />
            </>,
            { wrapper: PredWrapper }
        );

        await waitFor(() => expect(setModel).toHaveBeenCalledTimes(1));
        await user.click(screen.getByTestId('train-button'));
        await waitFor(() => expect(setModel).toHaveBeenCalledTimes(2));
        //rerender(<Trainer />);
        await waitFor(() => expect(screen.getByTestId('alert-complete')).toBeVisible());
    });
});
