import { atom } from 'jotai';
import { BehaviourType } from './workflow/Behaviour/Behaviour';
import { SaveProperties } from './workflow/ImageWorkspace/SaveDialog';
import randomId from './util/randomId';
import { AudioExample, TeachableModel } from '@genai-fi/classifier';
export interface ISample {
    data: HTMLCanvasElement | AudioExample;
    id: string;
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

export const prediction = atom<IPrediction[]>([]);

export const predictionError = atom<boolean>(false);

export const predictionHeatmap = atom<number[][] | null>(null);

export const serialWriterInstance = atom<WritableStreamDefaultWriter<Uint8Array> | null>(null);

export const predictedIndex = atom<number>(-1);

export const behaviourState = atom<BehaviourType[]>([]);

export const classState = atom<IClassification[]>([]);

export const modelState = atom<TeachableModel | undefined>(undefined);

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

export const feedbackAtom = atom<boolean>(false);
