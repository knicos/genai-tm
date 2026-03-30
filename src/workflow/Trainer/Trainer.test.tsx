import { describe, it, vi } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Trainer from './Trainer';
import TestWrapper from '../../util/TestWrapper';
import userEvent from '@testing-library/user-event';
import { classState, modelState } from '../../state';
import { createStore } from 'jotai';
import RecoilObserver from '../../util/Observer';
import { type TeachableModel } from '@genai-fi/classifier';

vi.mock('@genai-fi/classifier', () => {
    const obj = {
        createModel: vi.fn(() => new obj.ImageModel()),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ImageModel: vi.fn(function (this: any) {
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
            this.getLabels = vi.fn(() => ['Class 1', 'Class 2']);
            this.getNumExamples = vi.fn(() => 10);
            this.getNumValidation = vi.fn(() => 2);
            this.getExamplesPerClass = vi.fn(() => [5, 5]);
            this.predict = vi.fn(() =>
                Promise.resolve({
                    predictions: [
                        { className: 'Class 1', probability: 0.6 },
                        { className: 'Class 2', probability: 0.4 },
                    ],
                })
            );
        }),
    };
    return obj;
});

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
            variant: 'image',
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

    it('can train with disabled classes filtered out', async ({ expect }) => {
        const user = userEvent.setup();

        const model = {
            ready: vi.fn(async () => true),
            isTrained: vi.fn(() => false),
            addExample: vi.fn(),
            train: vi.fn(),
            variant: 'image',
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
                disabled: false,
            },
            {
                label: 'Class 2',
                samples: [
                    { data: document.createElement('canvas'), id: '' },
                    { data: document.createElement('canvas'), id: '' },
                ],
                disabled: true, // This class is disabled
            },
            {
                label: 'Class 3',
                samples: [
                    { data: document.createElement('canvas'), id: '' },
                    { data: document.createElement('canvas'), id: '' },
                ],
                disabled: false,
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

        // Training should work with 2 enabled classes (Class 1 and Class 3)
        // even though there are 3 total classes
        await user.click(screen.getByTestId('train-button'));

        // Verify a new model was created
        await waitFor(() => expect(setModel).toHaveBeenCalledTimes(2));
    });

    it('excludes disabled class data from training', async ({ expect }) => {
        const user = userEvent.setup();

        // Track what labels are set on the new model during training
        const setLabelsSpy = vi.fn();

        const model = {
            ready: vi.fn(async () => true),
            isTrained: vi.fn(() => false),
            getVariant: vi.fn(() => 'image'),
            addExample: vi.fn(),
            train: vi.fn(),
            setLabels: setLabelsSpy,
        } as unknown as TeachableModel;

        const store = createStore();
        store.set(modelState, model);
        store.set(classState, [
            {
                label: 'Enabled 1',
                samples: [
                    { data: document.createElement('canvas'), id: '' },
                    { data: document.createElement('canvas'), id: '' },
                ],
                disabled: false,
            },
            {
                label: 'Disabled Class',
                samples: [
                    { data: document.createElement('canvas'), id: '' },
                    { data: document.createElement('canvas'), id: '' },
                ],
                disabled: true,
            },
            {
                label: 'Enabled 2',
                samples: [
                    { data: document.createElement('canvas'), id: '' },
                    { data: document.createElement('canvas'), id: '' },
                ],
                disabled: false,
            },
        ]);

        let modelInstance: TeachableModel | undefined;
        const setModel = (newModel: TeachableModel | undefined) => {
            modelInstance = newModel;
        };

        function PredWrapper({ children }: React.PropsWithChildren) {
            return (
                <TestWrapper initializeState={store}>
                    <RecoilObserver<TeachableModel | undefined>
                        node={modelState}
                        onChange={setModel}
                    />
                    {children}
                </TestWrapper>
            );
        }
        render(<Trainer />, { wrapper: PredWrapper });

        await user.click(screen.getByTestId('train-button'));
        await waitFor(() => expect(screen.getByTestId('alert-complete')).toBeVisible());

        // Verify setLabels was called with only enabled classes
        expect(modelInstance?.setLabels).toHaveBeenCalledWith(['Enabled 1', 'Enabled 2']);
    });

    it('shows add more samples or classes first message when only disabled classes exist', async ({ expect }) => {
        const store = createStore();
        store.set(classState, [
            {
                label: 'Class 1',
                samples: [
                    { data: document.createElement('canvas'), id: '' },
                    { data: document.createElement('canvas'), id: '' },
                ],
                disabled: true,
            },
            {
                label: 'Class 2',
                samples: [
                    { data: document.createElement('canvas'), id: '' },
                    { data: document.createElement('canvas'), id: '' },
                ],
                disabled: true,
            },
        ]);

        function PredWrapper({ children }: React.PropsWithChildren) {
            return <TestWrapper initializeState={store}>{children}</TestWrapper>;
        }
        render(<Trainer />, { wrapper: PredWrapper });

        // Should show "add more" message since no enabled classes with samples
        expect(screen.getByTestId('alert-addmore')).toBeVisible();
    });
});
