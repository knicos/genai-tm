import { describe, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import TestWrapper from '../../util/TestWrapper';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import UnderTheHood from './UnderTheHood';
import { createStore } from 'jotai';
import { modelState, ModelStats, modelStats, trainingHistory } from '@genaitm/state';
import { TeachableModel } from '@genai-fi/classifier';

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        this.predict = vi.fn(() =>
            Promise.resolve({
                predictions: [
                    { className: 'class 1', probability: 0.2 },
                    { className: 'class 2', probability: 0.4 },
                ],
            })
        );
        this.ready = vi.fn(async () => true);
        this.isTrained = vi.fn(() => true);
        this.getImageSize = vi.fn(() => 224);
        this.getVariant = vi.fn(() => 'image');
        this.dispose = vi.fn();
        this.estimate = vi.fn();
        this.draw = vi.fn();
        this.setXAICanvas = vi.fn();
        this.getNumExamples = vi.fn(() => 10);
        this.getNumValidation = vi.fn(() => 2);
        this.getExamplesPerClass = vi.fn(() => [5, 5]);
    }),
}));

describe('UnderTheHood component', () => {
    it('renders', async ({ expect }) => {
        render(<UnderTheHood />, { wrapper: TestWrapper });
        await waitFor(() => expect(screen.getByText('underTheHood.title')).toBeVisible());
    });

    it('shows history', async ({ expect }) => {
        render(<UnderTheHood />, { wrapper: TestWrapper });
        const store = createStore();
        store.set(trainingHistory, [
            {
                epoch: 1,
                loss: 0.5,
                accuracy: 0.8,
                valLoss: 0.4,
                valAccuracy: 0.85,
            },
            {
                epoch: 2,
                loss: 0.4,
                accuracy: 0.85,
                valLoss: 0.35,
                valAccuracy: 0.88,
            },
        ]);
        store.set(modelState, new TeachableModel('image'));

        function NoPredWrapper({ children }: React.PropsWithChildren) {
            return <TestWrapper initializeState={store}>{children}</TestWrapper>;
        }

        render(<UnderTheHood />, { wrapper: NoPredWrapper });

        await waitFor(() => expect(screen.getByText('charts.accuracy')).toBeVisible());
        expect(screen.getAllByText('charts.loss')).toHaveLength(2);
    });

    it('shows stats', async ({ expect }) => {
        render(<UnderTheHood />, { wrapper: TestWrapper });
        const store = createStore();
        const stats: ModelStats = {
            labels: ['class1', 'class2'],
            confusionMatrix: [
                [5, 1],
                [0, 4],
            ],
            accuracyPerClass: [
                { accuracy: 1, samples: 5 },
                { accuracy: 1, samples: 5 },
            ],
            overallAccuracy: 1,
        };
        store.set(modelStats, stats);
        store.set(modelState, new TeachableModel('image'));

        function NoPredWrapper({ children }: React.PropsWithChildren) {
            return <TestWrapper initializeState={store}>{children}</TestWrapper>;
        }

        render(<UnderTheHood />, { wrapper: NoPredWrapper });

        await waitFor(() => expect(screen.getByText('charts.samples')).toBeVisible());
        expect(screen.getAllByText('class1')).toHaveLength(3);
        expect(screen.getAllByText('class2')).toHaveLength(3);
        expect(screen.getAllByText('5')).toHaveLength(3);
    });
});
