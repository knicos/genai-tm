import React, { useRef, useEffect, useState } from "react";
import SvgLayer, {ILine} from "./SvgLayer";
import { TrainingData } from "../trainingdata/TrainingData";
import { Trainer } from "../trainer/Trainer";
import { Preview } from "../preview/Preview";
import { IConnection, extractNodesFromElements, generateLines } from "./lines";
import Output from "../Output/Output";
import Behaviours, { BehaviourType } from "../Behaviours/Behaviours";
import { useTranslation } from "react-i18next";
import { TeachableMobileNet } from '@teachablemachine/image';
import { IClassification } from "../../state";
import style from "./TeachableMachine.module.css";
import { useVariant } from "../../util/variant";

const connections: IConnection[] = [
    {start: "class", end: "trainer", startPoint: "right", endPoint: "left"},
    {start: "trainer", end: "model", startPoint: "right", endPoint: "left"},
    {start: "model", end: "output", startPoint: "right", endPoint: "left"},
    {start: "output", end: "behaviours", startPoint: "right", endPoint: "left"},
];

interface Props {
    step: number;
    visitedStep: number;
    onComplete: (step: number) => void;
}

export default function Workspace({step, visitedStep, onComplete}: Props) {
    const {namespace} = useVariant();
    const {t} = useTranslation(namespace);
    const [behaviours, setBehaviours] = useState<BehaviourType[]>([]);
    const [pred, setPred] = useState(-1);
    const [model, setModel] = useState<TeachableMobileNet | undefined>();
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

    useEffect(() => {
        if (model) onComplete(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [model]);

    return <div className={style.workspace} ref={wkspaceRef}>
        <SvgLayer lines={lines} />
        <div className={style.container}>
            <TrainingData disabled={step > 0} data={data} setData={setData} active={true} />
            <Trainer disabled={step > 0} focus={step === 0} data={data} model={model} setModel={setModel} />
            <Preview model={model} onPrediction={setPred}/>
            {<Output hidden={visitedStep < 1} focus={step === 1} disabled={step !== 1} predicted={pred} behaviours={behaviours} />}
            {<Behaviours hidden={visitedStep < 1} disabled={step !== 1} classes={model?.getLabels() || []} behaviours={behaviours} setBehaviours={setBehaviours}/>}
        </div>
    </div>;
}