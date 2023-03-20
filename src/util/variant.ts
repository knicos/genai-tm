import React, { useContext } from "react";

export type Features = "advancedMenu";

export interface IVariantContext {
    namespace: "translation" | "image_4_9" | "image_adv";
    advancedMenu?: boolean;
}

export const VariantContext = React.createContext<IVariantContext>({
    namespace: "translation",
});

export function useVariant() {
    return useContext(VariantContext);
}