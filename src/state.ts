import { atom } from 'recoil';
import { BehaviourType } from './components/Behaviour/Behaviour';
import { SaveProperties } from './components/ImageWorkspace/SaveDialog';
import randomId from './util/randomId';
import { TeachableModel } from './util/TeachableModel';

export interface IClassification {
    label: string;
    samples: HTMLCanvasElement[];
}

export const fileData = atom<File | null>({
    key: 'fileData',
    default: null,
});

export interface IPrediction {
    className: string;
    probability: number;
}

export const prediction = atom<IPrediction[]>({
    key: 'prediction',
    default: [],
});

export const predictedIndex = atom<number>({
    key: 'predictedIndex',
    default: -1,
});

export const behaviourState = atom<BehaviourType[]>({
    key: 'behaviours',
    default: [],
});

export const classState = atom<IClassification[]>({
    key: 'classes',
    default: [],
});

export const modelState = atom<TeachableModel | undefined>({
    key: 'model',
    default: undefined,
    dangerouslyAllowMutability: true,
});

export const saveState = atom<SaveProperties | null>({
    key: 'saving',
    default: null,
});

export const sessionCode = atom<string>({
    key: 'sessionCode',
    default: randomId(8),
});

export const sessionPassword = atom<string>({
    key: 'sessionPassword',
    default: randomId(20),
});

export const sharingActive = atom<boolean>({
    key: 'p2p',
    default: false,
});
