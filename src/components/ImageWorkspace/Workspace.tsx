import React, { useRef, useEffect, useState, useCallback } from "react";
import SvgLayer, {ILine} from "./SvgLayer";
import { TrainingData } from "../trainingdata/TrainingData";
import { Trainer } from "../trainer/Trainer";
import { Preview, IPrediction } from "../preview/Preview";
import { IConnection, extractNodesFromElements, generateLines } from "./lines";
import Output from "../Output/Output";
import Behaviours, { BehaviourType } from "../Behaviours/Behaviours";
import { useTranslation } from "react-i18next";
import { TeachableMobileNet } from '@teachablemachine/image';
import { IClassification } from "../../state";
import style from "./TeachableMachine.module.css";
import { useVariant } from "../../util/variant";
import Input from "../Input/Input";
import SaveDialog, { SaveProperties } from "./SaveDialog";
import { saveProject } from "./saver";

const connections: IConnection[] = [
    {start: "class", end: "trainer", startPoint: "right", endPoint: "left"},
    {start: "trainer", end: "model", startPoint: "right", endPoint: "left"},
    {start: "model", end: "behaviour", startPoint: "right", endPoint: "left"},
    {start: "behaviour", end: "output", startPoint: "right", endPoint: "left"},
    {start: "input", end: "model", startPoint: "bottom", endPoint: "top"},
];

interface Props {
    step: number;
    visitedStep: number;
    onComplete: (step: number) => void;
    saveTrigger?: () => void;
}

export default function Workspace({step, visitedStep, onComplete, saveTrigger}: Props) {
    const {namespace} = useVariant();
    const {t} = useTranslation(namespace);
    const [behaviours, setBehaviours] = useState<BehaviourType[]>([]);
    const [pred, setPred] = useState(-1);
    const [model, setModel] = useState<TeachableMobileNet | undefined>();
    const [lastPrediction, setLastPrediction] = useState<IPrediction[]>([])
    const [data, setData] = useState<IClassification[]>([
        {
            label: `${t("trainingdata.labels.class")} 1`,
            samples: []
        },
        {
            label: `${t("trainingdata.labels.class")} 2`,
            samples: []
        }
    ]);
    const [lines, setLines] = useState<ILine[]>([]);

    const observer = useRef<ResizeObserver>();
    const wkspaceRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (wkspaceRef.current) {
            observer.current = new ResizeObserver(() => {
                if (wkspaceRef.current) {
                    const nodes = extractNodesFromElements(wkspaceRef.current.children[1] as HTMLElement);
                    setLines(generateLines(nodes, connections));
                }
            });
            observer.current.observe(wkspaceRef.current);
            const children = wkspaceRef.current.children[1]?.children;
            if (children) {
                for (let i=0; i<children.length; ++i) {
                    const child = children[i];
                    observer.current.observe(child);
                }
            }
            return () => {
                observer.current?.disconnect();
            }
        }
    }, []);

    const doPrediction = useCallback(async (image: HTMLCanvasElement) => {
        if (model) {
            const prediction = await model.predict(image);
            setLastPrediction(prediction);

            const nameOfMax = prediction.reduce((prev, val) => ((val.probability > prev.probability) ? val : prev));
            setPred(prediction.indexOf(nameOfMax));
        }
    }, [setPred, setLastPrediction, model]);

    useEffect(() => {
        if (model) onComplete(1);
    }, [model, onComplete]);

    const doSave = useCallback((props: SaveProperties) => {
        saveProject(
            "my-classifier.zip",
            model,
            (props.behaviours) ? behaviours : undefined,
            (props.samples) ? data : undefined,
        );
    }, [behaviours, model, data]);

    const doModelSave = useCallback(() => {
        saveProject(
            "my-model.zip",
            model
        );
    }, [model]);

    return <div className={style.workspace} ref={wkspaceRef}>
        <SvgLayer lines={lines} />
        <div className={style.container}>
            <TrainingData disabled={step > 0} data={data} setData={setData} active={true} />
            <Trainer disabled={step > 0} focus={step === 0} data={data} model={model} setModel={setModel} />
            <div className={style.column} data-widget="container">
                <Input onCapture={doPrediction} enabled={!!model} />
                <Preview model={model} prediction={lastPrediction} onExport={doModelSave} />
            </div>
            <Behaviours hidden={visitedStep < 1} focus={step === 1} disabled={step !== 1} classes={model?.getLabels() || []} behaviours={behaviours} setBehaviours={setBehaviours}/>
            <Output hidden={visitedStep < 1} disabled={step !== 1} predicted={pred} behaviours={behaviours} />
        </div>

        <SaveDialog trigger={saveTrigger} onSave={doSave} hasModel={!!model} />
    </div>;
}