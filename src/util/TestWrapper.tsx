import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { MutableSnapshot, RecoilRoot } from 'recoil';
import { VariantContext } from './variant';
import _settings from '../views/ImageGeneral/configuration.json';
import { VariantConfiguration } from '../views/ImageGeneral/ImageGeneral';

const settings = _settings as VariantConfiguration;

interface Props extends React.PropsWithChildren {
    initializeState?: (snap: MutableSnapshot) => void;
}

export default function TestWrapper({ initializeState, children }: Props) {
    return (
        <RecoilRoot initializeState={initializeState}>
            <BrowserRouter>
                <VariantContext.Provider value={settings.base}>{children}</VariantContext.Provider>
            </BrowserRouter>
        </RecoilRoot>
    );
}
