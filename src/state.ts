import { atom } from "recoil";

export interface IClassification {
    label: string;
    samples: HTMLCanvasElement[];
};

export const fileData = atom<File | null>({
    key: 'fileData',
    default: null,
});
