import React from "react";
import { IVariantContext, VariantContext } from "../../util/variant";
import _settings from "./settings.json";
import ImageClassifier from "../../components/ImageClassifier/ImageClassifier";

const settings = _settings as IVariantContext;

export function Component() {
    return <VariantContext.Provider value={settings}>
        <ImageClassifier />
    </VariantContext.Provider>;
}
