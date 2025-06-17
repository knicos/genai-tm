import { IVariantContext, VariantContext } from '../../util/variant';
import _settings from './configuration.json';
import { useSearchParams, useParams } from 'react-router-dom';
import { decompressFromEncodedURIComponent } from 'lz-string';
import ImageClassifier from './ImageClassifier';
import { Privacy } from '@genai-fi/base';
import gitInfo from '../../generatedGitInfo.json';

export type VARIANTS = keyof typeof _settings;
export type VariantConfiguration = Record<VARIANTS, IVariantContext>;

const settings = _settings as VariantConfiguration;

export function Component() {
    const [params] = useSearchParams();
    const { kind, variant } = useParams();

    if (!variant || !(variant in _settings)) {
        return <div>Unknown variant {variant}</div>;
    }
    if (!kind || !(kind in _settings)) {
        return <div>Unknown model type {kind}</div>;
    }

    const customStr = decompressFromEncodedURIComponent(params.get('c') || '');
    const custom = (customStr ? JSON.parse(customStr) : {}) as IVariantContext;

    const merged = {
        ...settings.base,
        ...settings[kind as VARIANTS],
        ...settings[variant as VARIANTS],
        ...custom,
    };

    return (
        <VariantContext.Provider value={merged}>
            <ImageClassifier />
            <Privacy
                position="bottomLeft"
                appName="tm"
                tag={gitInfo.gitTag || 'notag'}
            />
        </VariantContext.Provider>
    );
}
