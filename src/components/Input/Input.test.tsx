import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Input from './Input';
import TestWrapper from '../../util/TestWrapper';
import { TeachableMobileNet } from '@teachablemachine/image';
import RecoilObserver from '../../util/Observer';
import { prediction, predictedIndex } from '../../state';

jest.mock('@teachablemachine/image', () => ({
    Webcam: function () {
        return {
            setup: jest.fn(),
            play: jest.fn(),
            pause: jest.fn(),
            stop: jest.fn(),
            update: jest.fn(),
            canvas: global.document.createElement('canvas'),
        };
    },
}));

describe('Input component', () => {
    it('renders', async () => {
        render(<Input />, { wrapper: TestWrapper });
        expect(screen.getByTestId('widget-input.labels.title')).toBeInTheDocument();
    });

    it('can do predictions', async () => {
        const onPredict = jest.fn();

        const model = {
            predict: jest.fn(() => [{ className: 'Class 1', probability: 0.1 }]),
        } as unknown as TeachableMobileNet;

        render(
            <>
                <RecoilObserver
                    node={prediction}
                    onChange={onPredict}
                />
                <Input
                    model={model}
                    enabled={true}
                />
            </>,
            { wrapper: TestWrapper }
        );

        expect(screen.getByTestId('webcam')).toBeInTheDocument();
        await waitFor(() => expect(model.predict).toHaveBeenCalled());
        expect(onPredict).toHaveBeenCalledWith([{ className: 'Class 1', probability: 0.1 }]);
    });

    it('can select the best prediction', async () => {
        const onPredict = jest.fn();

        const model = {
            predict: jest.fn(() => [
                { className: 'Class 1', probability: 0.1 },
                { className: 'Class 2', probability: 0.2 },
                { className: 'Class 3', probability: 0.12 },
                { className: 'Class 4', probability: 0.02 },
                { className: 'Class 5', probability: 0.199 },
            ]),
        } as unknown as TeachableMobileNet;

        render(
            <>
                <RecoilObserver
                    node={predictedIndex}
                    onChange={onPredict}
                />
                <Input
                    model={model}
                    enabled={true}
                />
            </>,
            { wrapper: TestWrapper }
        );

        await waitFor(() => expect(model.predict).toHaveBeenCalled());
        expect(onPredict).toHaveBeenCalledWith(1);
    });
});
