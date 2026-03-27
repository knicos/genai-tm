import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { createStore, Provider } from 'jotai';
import { VariantContext } from './variant';
import _settings from '../views/General/configuration.json';
import { VariantConfiguration } from '../views/General/General';
import { WorkflowLayout } from '@genai-fi/base';

const settings = _settings as VariantConfiguration;

interface Props extends React.PropsWithChildren {
    initializeState?: ReturnType<typeof createStore>;
}

export default function TestWrapper({ initializeState, children }: Props) {
    return (
        <Provider store={initializeState}>
            <BrowserRouter>
                <WorkflowLayout connections={[]}>
                    <VariantContext.Provider value={settings.base}>{children}</VariantContext.Provider>
                </WorkflowLayout>
            </BrowserRouter>
        </Provider>
    );
}
