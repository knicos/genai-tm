import { atom } from "recoil";
import { TeachableMobileNet } from '@teachablemachine/image';

export const tfModel = atom<TeachableMobileNet | null>({
    key: 'tfmodel',
    default: null,
});

export interface IClassification {
    label: string;
    samples: HTMLImageElement[];
};

export const stateClassifications = atom<IClassification[]>({
    key: 'classifications',
    default: [
        {
            label: 'Class 1',
            samples: []
        },
        {
            label: 'Class 2',
            samples: []
        }
    ]
});
