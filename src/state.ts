import { TeachableMobileNet } from '@teachablemachine/image';
import { atom } from 'recoil';
import { BehaviourType } from './components/Behaviour/Behaviour';

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

export const modelState = atom<TeachableMobileNet | undefined>({
    key: 'model',
    default: undefined,
    dangerouslyAllowMutability: true,
});
