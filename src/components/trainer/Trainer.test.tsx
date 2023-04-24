import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Trainer from './Trainer';
import TestWrapper from '../../util/TestWrapper';
import userEvent from '@testing-library/user-event';

jest.mock('@tensorflow/tfjs');
jest.mock('@teachablemachine/image', () => ({
    createTeachable: function () {
        return {
            setLabels: jest.fn(),
            setSeed: jest.fn(),
            addExample: jest.fn(),
            train: jest.fn(),
        };
    },
}));

describe('Trainer component', () => {
    it('shows add more message', async () => {
        const setModel = jest.fn();
        render(
            <Trainer
                data={[]}
                setModel={setModel}
            />,
            { wrapper: TestWrapper }
        );
        expect(screen.getByTestId('alert-addmore')).toBeVisible();
    });

    it('shows needs training', async () => {
        const setModel = jest.fn();
        render(
            <Trainer
                data={[
                    { label: 'Class 1', samples: [document.createElement('canvas'), document.createElement('canvas')] },
                    { label: 'Class 2', samples: [document.createElement('canvas'), document.createElement('canvas')] },
                ]}
                setModel={setModel}
            />,
            { wrapper: TestWrapper }
        );
        expect(screen.getByTestId('alert-needstraining')).toBeVisible();
    });

    it('can perform training', async () => {
        const user = userEvent.setup();
        const setModel = jest.fn((model: any) => {
            expect(model.addExample).toHaveBeenCalledTimes(4);
            expect(model.train).toHaveBeenCalled();
        });
        render(
            <Trainer
                data={[
                    { label: 'Class 1', samples: [document.createElement('canvas'), document.createElement('canvas')] },
                    { label: 'Class 2', samples: [document.createElement('canvas'), document.createElement('canvas')] },
                ]}
                setModel={setModel}
            />,
            { wrapper: TestWrapper }
        );

        await user.click(screen.getByTestId('train-button'));
        await waitFor(() => expect(setModel).toHaveBeenCalledTimes(1));
        await waitFor(() => expect(screen.getByTestId('alert-complete')).toBeVisible());
    });
});
