import { atom } from 'recoil';

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
