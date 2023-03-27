import JSZip from "jszip";
import { saveAs } from "file-saver";
import tfjs from "@tensorflow/tfjs";
import { BehaviourType } from "../Behaviours/Behaviours";
import { TeachableMobileNet } from '@teachablemachine/image';
import { IClassification } from "../../state";

export function saveProject(name: string, model?: TeachableMobileNet, behaviours?: BehaviourType[], samples?: IClassification[]) {
    const zip = new JSZip();
    if (samples) {
        const folder = zip.folder("samples");
        if (folder) {
            for (let j=0; j<samples.length; ++j) {
                const s = samples[j];
                for (let i=0; i<s.samples.length; ++i) {
                    const ss = s.samples[i];
                    folder.file(`${j}_${i}.png`, ss.toDataURL("image/png").split(";base64,")[1], { base64: true,  });
                }
            }
        }
    }
    if (behaviours) {
        zip.file("behaviours.json", JSON.stringify({
            behaviours,
            version: 1,
        }));
    }
    if (model) {
        zip.file("metadata.json", JSON.stringify(model.getMetadata()));

        model.save({save: async (artifact: tfjs.io.ModelArtifacts) => {
            if (artifact.weightData) zip.file("weights.bin", artifact.weightData);
            if (typeof artifact.modelTopology) {
                zip.file("model.json", JSON.stringify({
                    modelTopology: artifact.modelTopology,
                    weightsManifest: [{paths: ["./weights.bin"], weights: artifact.weightSpecs}],
                }));
            }

            const zipData = await zip.generateAsync({type: "blob"});
            saveAs(zipData, name);

            return {
                modelArtifactsInfo: {
                    dateSaved: new Date(),
                    modelTopologyType: "JSON"
                },
            } as tfjs.io.SaveResult;
        }})
    }
}