import React from 'react';
import { IVariantContext, VariantContext } from '../../util/variant';
import _settings from './settings.json';
import { useSearchParams } from 'react-router-dom';
import { decompressFromEncodedURIComponent } from 'lz-string';
import ImageClassifier from '../../components/ImageClassifier/ImageClassifier';

const settings = _settings as IVariantContext;

export function Component() {
    const [params] = useSearchParams();

    const customStr = decompressFromEncodedURIComponent(params.get('c') || '');
    const custom = (customStr ? JSON.parse(customStr) : {}) as IVariantContext;

    return (
        <VariantContext.Provider value={{ ...settings, ...custom }}>
            <ImageClassifier />
        </VariantContext.Provider>
    );
}
