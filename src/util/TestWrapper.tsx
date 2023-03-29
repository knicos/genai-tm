import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { MutableSnapshot, RecoilRoot } from 'recoil';
import { VariantContext, IVariantContext } from './variant';
import _settings from '../views/ImageGeneral/settings.json';

const settings = _settings as IVariantContext;

interface Props extends React.PropsWithChildren {
    initializeState?: (snap: MutableSnapshot) => void;
}

export default function TestWrapper({ initializeState, children }: Props) {
    return (
        <RecoilRoot initializeState={initializeState}>
            <BrowserRouter>
                <VariantContext.Provider value={settings}>{children}</VariantContext.Provider>
            </BrowserRouter>
        </RecoilRoot>
    );
}
