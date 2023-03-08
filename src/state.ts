import { atom } from "recoil";
import { TeachableMobileNet } from '@teachablemachine/image';

export const tfModel = atom<TeachableMobileNet | null>({
    key: 'tfmodel',
    default: null,
});

export interface IClassification {
    label: string;
    samples: [];
};

export const stateClassifications = atom<IClassification[]>({
    key: 'classifications',
    default: [
        {
            label: 'Classification 1',
            samples: []
        },
        {
            label: 'Classification 2',
            samples: []
        }
    ]
});
