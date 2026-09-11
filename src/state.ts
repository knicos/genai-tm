import { atom } from 'jotai';
import { BehaviourType } from './workflow/Behaviour/Behaviour';
import { SaveProperties } from './workflow/ImageWorkspace/SaveDialog';
import randomId from './util/randomId';
import { AudioExample, TeachableModel } from '@genai-fi/classifier';

interface FeatureFlags {
    allowReportProblem?: boolean;
    allowTransferLearning?: boolean;
}

function applyFeatureOverridesFromUrl(features: FeatureFlags): FeatureFlags {
    const params = new URLSearchParams(window.location.search);
    const patched = { ...features };

    for (const [key, raw] of params.entries()) {
        if (!(key in patched)) continue;
        const v = raw?.toLowerCase();

        if (v === 'true' || v === '1') {
            patched[key as keyof FeatureFlags] = true;
        } else if (v === 'false' || v === '0') {
            patched[key as keyof FeatureFlags] = false;
        } else if (v === '' || v === 'on') {
            patched[key as keyof FeatureFlags] = true;
        }
    }

    return patched;
}

export const featureFlagsAtom = atom(async () => {
    try {
        const isStagingEnv = !window.location.hostname.endsWith('gen-ai.fi');
        const response = await fetch(`${import.meta.env.VITE_APP_API}/features/${isStagingEnv ? 'tm-staging' : 'tm'}`);
        const data: { features: FeatureFlags } = await response.json();
        const features = data.features as FeatureFlags;
        return applyFeatureOverridesFromUrl(features);
    } catch {
        return {
            allowReportProblem: false,
            allowTransferLearning: false,
        };
    }
});

export interface ISample {
    data: HTMLCanvasElement | AudioExample;
    id: string;
    preview?: HTMLCanvasElement;
    fullPreview?: HTMLCanvasElement;
}

export interface IClassification {
    label: string;
    samples: ISample[];
    disabled?: boolean;
}

export const fileData = atom<File | null>(null);

export interface IPrediction {
    className: string;
    probability: number;
}

export interface IImageNetTopClass {
    classId: number;
    className: string;
    probability: number;
    imageUrls: string[];
}

export interface ITransferLearningConcept {
    classId: number;
    className: string;
    probability: number;
    imageUrls: string[];
}

export interface ITransferLearningClassProfile {
    userClassIndex: number;
    userClassLabel: string;
    sampleCount: number;
    topConcepts: ITransferLearningConcept[];
}

export interface ITransferLearningSimilarity {
    userClassIndex: number;
    userClassLabel: string;
    score: number;
}

export interface ITransferLearningExplanation {
    currentImageTopConcepts: ITransferLearningConcept[];
    userClassProfiles: ITransferLearningClassProfile[];
    userClassSimilarity: ITransferLearningSimilarity[];
}

export const prediction = atom<IPrediction[]>([]);

export const imageNetTop5 = atom<IImageNetTopClass[]>([]);

export const transferLearningExplanation = atom<ITransferLearningExplanation | null>(null);

export const predictionError = atom<boolean>(false);

export const predictionHeatmap = atom<number[][] | null>(null);

export const serialWriterInstance = atom<WritableStreamDefaultWriter<Uint8Array> | null>(null);

export const predictedIndex = atom<number>(-1);

export const behaviourState = atom<BehaviourType[]>([]);

export const classState = atom<IClassification[]>([]);

export const classLabelModifiedState = atom<boolean[]>([]);

export const modelState = atom<TeachableModel | undefined>(undefined);

export const modelLoaded = atom<boolean>(false);

export const saveState = atom<SaveProperties | null>(null);

export const loadState = atom<boolean>(false);

export const sessionCode = atom<string>(randomId(8));

export const sessionPassword = atom<string>(randomId(20));

export const sharingActive = atom<boolean>(false);

export const shareModel = atom<boolean>(false);

export const modelShared = atom<boolean>(false);

export const p2pActive = atom<boolean>(false);

export const fatalWebcam = atom<boolean>(false);

export const shareSamples = atom<boolean>(false);

export const inputImage = atom<HTMLCanvasElement | null>(null);

export const xaiEnabled = atom<boolean>(true);

export const showOpenDialog = atom<boolean>(false);

export const enableCamInput = atom<boolean>(true);

export const modelTraining = atom<boolean>(false);

export const activeNodes = atom<Set<string>>(new Set<string>());

export const menuShowSettings = atom<boolean>(false);

export interface TrainingMetrics {
    epoch: number;
    loss: number;
    accuracy: number;
    valLoss?: number;
    valAccuracy?: number;
}

export const trainingHistory = atom<TrainingMetrics[]>([]);

export interface ModelStats {
    labels: string[];
    confusionMatrix?: number[][];
    accuracyPerClass?: { accuracy: number; samples: number }[];
    overallAccuracy?: number;
}

export const modelStats = atom<ModelStats>({ labels: [] });
/**
 * null  = no pose prediction has been run yet for the current input
 * true  = the last pose prediction detected a person (XAI was drawn)
 * false = the last pose prediction found no human joints in the image
 */
export const poseDetected = atom<boolean | null>(null);
export const underTheHoodOpen = atom<boolean>(false);
export const feedbackAtom = atom<boolean>(false);

export interface INeuronActivationInfo {
    neuronId: number;
    activation: number;
    deltaFromMean: number;
    thumbnail?: HTMLCanvasElement;
    weight: number;
}

export interface INeuronProfile {
    neuronId: number;
    weight: number;
    meanActivation: number;
    maxActivation: number;
    thumbnail?: HTMLCanvasElement;
}

export interface IClassNeuronProfile {
    userClassIndex: number;
    userClassLabel: string;
    topNeurons: INeuronProfile[];
}

export interface INeuronExplanation {
    classNeuronProfiles: IClassNeuronProfile[];
    predictedClassNeurons: INeuronActivationInfo[];
}

export const neuronExplanation = atom<INeuronExplanation | null>(null);
