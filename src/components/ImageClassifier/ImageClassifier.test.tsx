import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import ImageClassifier from './ImageClassifier';
import TestWrapper from '../../util/TestWrapper';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',

    // have a common namespace used around the full app
    ns: ['translations'],
    defaultNS: 'translations',

    debug: true,

    interpolation: {
        escapeValue: false, // not needed for react!!
    },

    resources: { en: { image_adv: { trainingdata: { aria: { classCard: 'training for {{name}}' } } } } },
});

expect.extend(toHaveNoViolations);

jest.mock('@tensorflow/tfjs');
jest.mock('@teachablemachine/image', () => ({
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
    createTeachable: function () {
        return {
            setLabels: jest.fn(),
            getLabels: jest.fn(() => ['class 1', 'class 2']),
            setSeed: jest.fn(),
            addExample: jest.fn(),
            train: jest.fn(),
            predict: jest.fn(() => [
                { className: 'class 1', probability: 0.2 },
                { className: 'class 2', probability: 0.4 },
            ]),
        };
    },
}));

describe('ImageClassifier component', () => {
    it('renders', async () => {
        render(<ImageClassifier />, { wrapper: TestWrapper });
        expect(screen.getByText('behaviours.labels.title')).not.toBeVisible();
        expect(screen.getByTestId('widget-trainingdata.labels.class 1')).toBeInTheDocument();
        expect(screen.getByTestId('previous-step')).toBeDisabled();
        expect(screen.getByTestId('next-step')).toBeDisabled();
    });

    it('has no axe violations', async () => {
        const { container } = render(<ImageClassifier />, { wrapper: TestWrapper });
        expect(await axe(container)).toHaveNoViolations();
    });
});

describe('ImageClassifier Integration', () => {
    it('can follow the entire workflow', async () => {
        const user = userEvent.setup();
        render(<ImageClassifier />, { wrapper: TestWrapper });

        const sample1 = new File(['somedata'], 'sample1.png', { type: 'image/png' });
        const sample2 = new File(['somedata'], 'sample2.png', { type: 'image/png' });

        const class1element = screen.getByTestId('file-trainingdata.labels.class 1');
        expect(class1element).toBeInTheDocument();

        await user.upload(class1element, sample1);
        expect(await screen.findByTestId('sample-0')).toBeInTheDocument();

        const class2element = screen.getByTestId('file-trainingdata.labels.class 2');
        expect(class2element).toBeInTheDocument();

        await user.upload(class2element, sample2);

        const trainButton = screen.getByTestId('train-button');
        await waitFor(() => expect(trainButton).toBeEnabled());

        await user.click(trainButton);
        await waitFor(() => expect(screen.getByTestId('alert-complete')).toBeVisible());
        await waitFor(() => expect(screen.getByTestId('prediction-0')).toBeVisible());

        const nextButton = screen.getByTestId('next-step');
        expect(nextButton).toBeEnabled();
        await user.click(nextButton);

        expect(screen.getByTestId('widget-output.labels.title')).toBeVisible();
        await waitFor(() => expect(screen.getByTestId('widget-class 1')).toBeVisible());
        expect(screen.getByTestId('widget-class 2')).toBeVisible();
    });
});
