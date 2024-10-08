import React, { useContext } from 'react';
import { TMType } from './TeachableModel';

export type Features = 'advancedMenu';

export interface IVariantContext {
    namespace: 'translation' | 'image_4_9' | 'image_adv';
    advancedMenu?: boolean;
    modelSelect?: boolean;
    modelThreshold?: boolean;
    modelVariant: TMType;
    trainingStep?: boolean;
    behavioursStep?: boolean;
    imageBehaviours?: boolean;
    soundBehaviours?: boolean;
    textBehaviours?: boolean;
    speechBehaviours?: boolean;
    embedBehaviours?: boolean;
    sampleUploadFile?: boolean;
    classLimit?: number;
    disabledClassRemove?: boolean;
    disableAddClass?: boolean;
    initialClasses?: string[];
    disableClassNameEdit?: boolean;
    multipleBehaviours?: boolean;
    disableSaveSamples?: boolean;
    showTrainingAnimation?: boolean;
    resetOnLoad?: boolean;
    enableFileInput?: boolean;
    allowDeploy?: boolean;
    showDragTip?: boolean;
    usep2p?: boolean;
    showSettings?: boolean;
    showSaveReminder?: boolean;
    enabledP2PData?: boolean;
    enableCollaboration?: boolean;
    allowModelSharing?: boolean;
    allowHeatmap?: boolean;
}

export const VariantContext = React.createContext<IVariantContext>({
    namespace: 'translation',
    modelVariant: 'image',
});

export function useVariant() {
    return useContext(VariantContext);
}
