import React from 'react';
import { render, screen } from '@testing-library/react';
import Preview from './Preview';
import TestWrapper from '../../util/TestWrapper';
import { MutableSnapshot } from 'recoil';
import { prediction } from '../../state';

describe('Output component', () => {
    it('renders with no model', async () => {
        function NoPredWrapper({ children }: React.PropsWithChildren) {
            return (
                <TestWrapper
                    initializeState={(snap: MutableSnapshot) => {
                        snap.set(prediction, []);
                    }}
                >
                    {children}
                </TestWrapper>
            );
        }
        render(<Preview model={false} />, { wrapper: NoPredWrapper });
        expect(screen.getByText('model.labels.mustTrain')).toBeInTheDocument();
    });

    it('renders with model a model but no predictions', async () => {
        function NoPredWrapper({ children }: React.PropsWithChildren) {
            return (
                <TestWrapper
                    initializeState={(snap: MutableSnapshot) => {
                        snap.set(prediction, []);
                    }}
                >
                    {children}
                </TestWrapper>
            );
        }
        render(<Preview model={true} />, { wrapper: NoPredWrapper });
        expect(screen.queryByText('model.labels.mustTrain')).not.toBeInTheDocument();
    });

    it('shows 2 predictions', async () => {
        function PredWrapper({ children }: React.PropsWithChildren) {
            return (
                <TestWrapper
                    initializeState={(snap: MutableSnapshot) => {
                        snap.set(prediction, [
                            { className: 'Class1', probability: 0.5 },
                            { className: 'Class2', probability: 0.3 },
                        ]);
                    }}
                >
                    {children}
                </TestWrapper>
            );
        }
        render(<Preview model={true} />, { wrapper: PredWrapper });
        expect(screen.getByTestId('prediction-0')).toBeVisible();
        expect(screen.getByTestId('prediction-1')).toBeVisible();
        expect(screen.getByText('Class1')).toBeInTheDocument();
        expect(screen.getByText('Class2')).toBeInTheDocument();
    });
});
