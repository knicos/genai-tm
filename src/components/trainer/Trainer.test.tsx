import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Trainer from './Trainer';
import TestWrapper from '../../util/TestWrapper';
import userEvent from '@testing-library/user-event';
import { classState, modelState } from '../../state';
import { MutableSnapshot } from 'recoil';
import { TeachableModel } from '../../util/TeachableModel';
import RecoilObserver from '../../util/Observer';

jest.mock('@tensorflow/tfjs');
jest.mock('@knicos/tm-image', () => ({
    createTeachable: function () {
        return {
            setLabels: jest.fn(),
            setSeed: jest.fn(),
            addExample: jest.fn(),
            train: jest.fn(),
            setName: jest.fn(),
            getMetadata: jest.fn(() => ({})),
        };
    },
}));

describe('Trainer component', () => {
    it('shows add more message', async () => {
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

    it('shows needs training', async () => {
        function PredWrapper({ children }: React.PropsWithChildren) {
            return (
                <TestWrapper
                    initializeState={(snap: MutableSnapshot) => {
                        snap.set(classState, [
                            {
                                label: 'Class 1',
                                samples: [document.createElement('canvas'), document.createElement('canvas')],
                            },
                            {
                                label: 'Class 2',
                                samples: [document.createElement('canvas'), document.createElement('canvas')],
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

    it('can perform training', async () => {
        const user = userEvent.setup();

        const model = {
            ready: jest.fn(async () => true),
            isTrained: jest.fn(() => false),
            addExample: jest.fn(),
            train: jest.fn(),
            getVariant: jest.fn(() => 'image'),
        } as unknown as TeachableModel;

        const setModel = jest.fn((model: any) => {});

        function PredWrapper({ children }: React.PropsWithChildren) {
            return (
                <TestWrapper
                    initializeState={(snap: MutableSnapshot) => {
                        snap.set(classState, [
                            {
                                label: 'Class 1',
                                samples: [document.createElement('canvas'), document.createElement('canvas')],
                            },
                            {
                                label: 'Class 2',
                                samples: [document.createElement('canvas'), document.createElement('canvas')],
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

        await user.click(screen.getByTestId('train-button'));
        await waitFor(() => expect(setModel).toHaveBeenCalledTimes(1));
        rerender(<Trainer />);
        await waitFor(() => expect(screen.getByTestId('alert-complete')).toBeVisible());
    });
});
