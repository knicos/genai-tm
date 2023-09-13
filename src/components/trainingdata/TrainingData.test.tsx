import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TrainingData } from './TrainingData';
import TestWrapper from '../../util/TestWrapper';

describe('TrainingData component', () => {
    it('renders with no data', () => {
        render(
            <TrainingData
                active={true}
                data={[]}
                setData={() => {}}
                onFocused={() => {}}
            />,
            { wrapper: TestWrapper }
        );
        const linkElement = screen.getByTestId('addClass');
        expect(linkElement).toBeInTheDocument();
    });

    it('can add new classes', async () => {
        const user = userEvent.setup();
        const setData = jest.fn();
        render(
            <TrainingData
                active={true}
                data={[]}
                setData={setData}
                onFocused={() => {}}
            />,
            { wrapper: TestWrapper }
        );
        const linkElement = screen.getByText(/trainingdata.actions.addClass/i);
        await user.click(linkElement);
        expect(setData).toHaveBeenCalledTimes(1);
    });

    it('renders with multiple data items but no samples', () => {
        const testData = [
            { label: 'Class1', samples: [] },
            { label: 'Class2', samples: [] },
        ];
        render(
            <TrainingData
                active={true}
                data={testData}
                setData={() => {}}
                onFocused={() => {}}
            />,
            { wrapper: TestWrapper }
        );
        expect(screen.getByTestId('widget-Class1')).toBeInTheDocument();
        expect(screen.getByTestId('widget-Class2')).toBeInTheDocument();
    });

    it('renders with samples', () => {
        const canvas = document.createElement('canvas');
        canvas.setAttribute('data-testid', 'testcanvas');
        const testData = [{ label: 'Class1', samples: [{ data: canvas, id: '' }] }];
        render(
            <TrainingData
                active={true}
                data={testData}
                setData={() => {}}
                onFocused={() => {}}
            />,
            { wrapper: TestWrapper }
        );
        expect(screen.getByTestId('widget-Class1')).toBeInTheDocument();
        expect(screen.getByTestId('testcanvas')).toBeInTheDocument();
    });
});
