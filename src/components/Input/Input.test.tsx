import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Input from './Input';
import TestWrapper from '../../util/TestWrapper';
import RecoilObserver from '../../util/Observer';
import { prediction, predictedIndex, modelState } from '../../state';
import { TeachableModel } from '../../util/TeachableModel';
import { MutableSnapshot } from 'recoil';

jest.mock('@knicos/tm-image', () => ({
    Webcam: function () {
        return {
            setup: jest.fn(),
            play: jest.fn(),
            pause: jest.fn(),
            stop: jest.fn(),
            update: jest.fn(),
            canvas: global.document.createElement('canvas'),
            webcam: { paused: false },
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
            predict: jest.fn(() => {
                return [{ className: 'Class 1', probability: 0.1 }];
            }),
            isTrained: jest.fn(() => true),
            getImageSize: jest.fn(() => 224),
            getVariant: jest.fn(() => 'image'),
            getLabels: jest.fn(() => ['Class 1']),
            estimate: jest.fn(),
            draw: jest.fn(),
        } as unknown as TeachableModel;

        function ModelWrapper({ children }: React.PropsWithChildren) {
            return (
                <TestWrapper
                    initializeState={(snap: MutableSnapshot) => {
                        snap.set(predictedIndex, -1);
                        snap.set(modelState, model);
                    }}
                >
                    {children}
                </TestWrapper>
            );
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
            isTrained: jest.fn(() => true),
            getImageSize: jest.fn(() => 224),
            getVariant: jest.fn(() => 'image'),
            getLabels: jest.fn(() => ['Class 1']),
            estimate: jest.fn(),
            draw: jest.fn(),
        } as unknown as TeachableModel;

        function ModelWrapper({ children }: React.PropsWithChildren) {
            return (
                <TestWrapper
                    initializeState={(snap: MutableSnapshot) => {
                        snap.set(predictedIndex, -1);
                        snap.set(modelState, model);
                    }}
                >
                    {children}
                </TestWrapper>
            );
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
