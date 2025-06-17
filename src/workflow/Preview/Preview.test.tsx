import { describe, it } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import Preview from './Preview';
import TestWrapper from '../../util/TestWrapper';
import { createStore } from 'jotai';
import { prediction } from '../../state';

describe('Preview component', () => {
    it('renders with no model', async ({ expect }) => {
        const store = createStore();
        store.set(prediction, []);

        function NoPredWrapper({ children }: React.PropsWithChildren) {
            return <TestWrapper initializeState={store}>{children}</TestWrapper>;
        }
        render(<Preview />, { wrapper: NoPredWrapper });
        expect(screen.getByText('model.labels.mustTrain')).toBeInTheDocument();
    });

    it('renders with model a model but no predictions', async ({ expect }) => {
        const store = createStore();
        store.set(prediction, [{ className: 'Class1', probability: 0.5 }]);

        function NoPredWrapper({ children }: React.PropsWithChildren) {
            return <TestWrapper initializeState={store}>{children}</TestWrapper>;
        }
        render(<Preview />, { wrapper: NoPredWrapper });
        expect(screen.queryByText('model.labels.mustTrain')).not.toBeInTheDocument();
    });

    it('shows 2 predictions', async ({ expect }) => {
        const store = createStore();
        store.set(prediction, [
            { className: 'Class1', probability: 0.5 },
            { className: 'Class2', probability: 0.3 },
        ]);

        function PredWrapper({ children }: React.PropsWithChildren) {
            return <TestWrapper initializeState={store}>{children}</TestWrapper>;
        }
        render(<Preview />, { wrapper: PredWrapper });
        expect(screen.getByTestId('prediction-0')).toBeVisible();
        expect(screen.getByTestId('prediction-1')).toBeVisible();
        expect(screen.getByText('Class1')).toBeInTheDocument();
        expect(screen.getByText('Class2')).toBeInTheDocument();
    });
});
