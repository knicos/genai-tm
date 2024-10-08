import { describe, it, vi } from 'vitest';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Trainer from './Trainer';
import TestWrapper from '../../util/TestWrapper';
import userEvent from '@testing-library/user-event';
import { classState, modelState } from '../../state';
import { MutableSnapshot } from 'recoil';
import { TeachableModel } from '../../util/TeachableModel';
import RecoilObserver from '../../util/Observer';

vi.mock('@tensorflow/tfjs');
vi.mock('@knicos/tm-image', () => ({
    createTeachable: function () {
        return {
            setLabels: vi.fn(),
            setSeed: vi.fn(),
            addExample: vi.fn(),
            train: vi.fn(async () => {}),
            setName: vi.fn(),
            getMetadata: vi.fn(() => ({})),
        };
    },
}));
vi.mock('../../util/xai.ts', () => ({
    CAM: function () {
        return {};
    },
}));

describe('Trainer component', () => {
    it('shows add more message', async ({ expect }) => {
        function PredWrapper({ children }: React.PropsWithChildren) {
            return (
                <TestWrapper
                    initializeState={(snap: MutableSnapshot) => {
                        snap.set(classState, []);
                    }}
                >
                    {children}
                </TestWrapper>
            );
        }
        render(<Trainer />, { wrapper: PredWrapper });
        expect(screen.getByTestId('alert-addmore')).toBeVisible();
    });

    it('shows needs training', async ({ expect }) => {
        function PredWrapper({ children }: React.PropsWithChildren) {
            return (
                <TestWrapper
                    initializeState={(snap: MutableSnapshot) => {
                        snap.set(classState, [
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
                    }}
                >
                    {children}
                </TestWrapper>
            );
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

        function PredWrapper({ children }: React.PropsWithChildren) {
            return (
                <TestWrapper
                    initializeState={(snap: MutableSnapshot) => {
                        snap.set(classState, [
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
                        snap.set(modelState, model);
                    }}
                >
                    {children}
                </TestWrapper>
            );
        }
        const { rerender } = render(
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
        rerender(<Trainer />);
        await waitFor(() => expect(screen.getByTestId('alert-complete')).toBeVisible());
    });
});
