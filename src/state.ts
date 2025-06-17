import { atom } from 'jotai';
import { BehaviourType } from './workflow/Behaviour/Behaviour';
import { SaveProperties } from './workflow/ImageWorkspace/SaveDialog';
import randomId from './util/randomId';
import { TeachableModel } from '@genai-fi/classifier';
export interface ISample {
    data: HTMLCanvasElement;
    id: string;
}

export interface IClassification {
    label: string;
    samples: ISample[];
}

export const fileData = atom<File | null>(null);

export interface IPrediction {
    className: string;
    probability: number;
}

export const prediction = atom<IPrediction[]>([]);

export const predictionError = atom<boolean>(false);

export const predictionHeatmap = atom<number[][] | null>(null);

export const predictedIndex = atom<number>(-1);

export const behaviourState = atom<BehaviourType[]>([]);

export const classState = atom<IClassification[]>([]);

export const modelState = atom<TeachableModel | undefined>(undefined);

export const saveState = atom<SaveProperties | null>(null);

export const loadState = atom<boolean>(false);

export const sessionCode = atom<string>(randomId(8));

export const sessionPassword = atom<string>(randomId(20));

export const sharingActive = atom<boolean>(false);

export const p2pActive = atom<boolean>(false);

export const fatalWebcam = atom<boolean>(false);

export const shareSamples = atom<boolean>(false);

export const inputImage = atom<HTMLCanvasElement | null>(null);

export const showOpenDialog = atom<boolean>(false);

export const enableCamInput = atom<boolean>(true);

export const modelTraining = atom<boolean>(false);

export const activeNodes = atom<Set<string>>(new Set<string>());
