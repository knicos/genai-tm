import { describe, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import ImageClassifier from './ImageClassifier';
import TestWrapper from '../../util/TestWrapper';
import userEvent from '@testing-library/user-event';
// import { axe, toHaveNoViolations } from 'jest-axe';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',

    // have a common namespace used around the full app
    ns: ['translations'],
    defaultNS: 'translations',

    debug: false,

    interpolation: {
        escapeValue: false, // not needed for react!!
    },

    resources: { en: { image_adv: { trainingdata: { aria: { classCard: 'training for {{name}}' } } } } },
});

// expect.extend(toHaveNoViolations);

const mockLabels = ['class 1', 'class 2'];

vi.mock('@tensorflow/tfjs');

vi.mock('@genai-fi/base', async (importOriginal) => ({
    ...(await importOriginal<typeof import('@genai-fi/base')>()),
    Webcam: function ({
        onCapture,
        onPostprocess,
    }: {
        onCapture: (img: HTMLCanvasElement) => void;
        onPostprocess: (img: HTMLCanvasElement) => void;
    }) {
        setTimeout(() => {
            const canvas = document.createElement('canvas');
            canvas.width = 224;
            canvas.height = 224;
            onCapture(canvas);
            onPostprocess(canvas);
        }, 10);
        return <div data-testid="webcam"></div>;
    },
}));

vi.mock('@genai-fi/classifier', () => ({
    TeachableModel: vi.fn(function (this: any) {
        this.setLabels = vi.fn();
        this.setName = vi.fn();
        this.getLabels = vi.fn(() => mockLabels);
        this.setSeed = vi.fn();
        this.addExample = vi.fn();
        this.train = vi.fn(async () => {});
        this.getMetadata = vi.fn(() => ({
            imageSize: 224,
        }));
        this.predict = vi.fn(() => ({
            predictions: [
                { className: 'class 1', probability: 0.2 },
                { className: 'class 2', probability: 0.4 },
            ],
        }));
        this.ready = vi.fn(async () => true);
        this.isTrained = vi.fn(() => true);
        this.getImageSize = vi.fn(() => 224);
        this.getVariant = vi.fn(() => 'image');
        this.dispose = vi.fn();
        this.estimate = vi.fn();
        this.draw = vi.fn();
    }),
}));

describe('ImageClassifier component', () => {
    it('renders', async ({ expect }) => {
        render(<ImageClassifier />, { wrapper: TestWrapper });
        await waitFor(() => expect(screen.getByText('behaviours.labels.title')).not.toBeVisible());
        expect(screen.getByTestId('widget-trainingdata.labels.class 1')).toBeInTheDocument();
        expect(screen.getByTestId('next-step')).toBeDisabled();
    });

    /*it('has no axe violations', async () => {
        const { container } = render(<ImageClassifier />, { wrapper: TestWrapper });
        expect(await axe(container)).toHaveNoViolations();
    });*/
});

describe('ImageClassifier Integration', () => {
    it('can follow the entire workflow', { timeout: 10000 }, async ({ expect }) => {
        const user = userEvent.setup();
        render(<ImageClassifier />, { wrapper: TestWrapper });

        const sample1 = new File(['somedata'], 'sample1.png', { type: 'image/png' });
        const sample2 = new File(['somedata'], 'sample2.png', { type: 'image/png' });
        const sample3 = new File(['somedata'], 'sample3.png', { type: 'image/png' });
        const sample4 = new File(['somedata'], 'sample4.png', { type: 'image/png' });

        const class1element = screen.getByTestId('file-trainingdata.labels.class 1');
        expect(class1element).toBeInTheDocument();

        await user.upload(class1element, sample1);
        expect(await screen.findByTestId('sample-1')).toBeInTheDocument();

        const class2element = screen.getByTestId('file-trainingdata.labels.class 2');
        expect(class2element).toBeInTheDocument();

        await user.upload(class2element, sample2);

        const trainButton = screen.getByTestId('train-button');
        expect(trainButton).toBeDisabled();

        await user.upload(class1element, sample3);
        await user.upload(class2element, sample4);
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
