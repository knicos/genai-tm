import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { createStore, Provider } from 'jotai';
import { VariantContext } from './variant';
import _settings from '../views/ImageGeneral/configuration.json';
import { VariantConfiguration } from '../views/ImageGeneral/ImageGeneral';

const settings = _settings as VariantConfiguration;

interface Props extends React.PropsWithChildren {
    initializeState?: ReturnType<typeof createStore>;
}

export default function TestWrapper({ initializeState, children }: Props) {
    return (
        <Provider store={initializeState}>
            <BrowserRouter>
                <VariantContext.Provider value={settings.base}>{children}</VariantContext.Provider>
            </BrowserRouter>
        </Provider>
    );
}
