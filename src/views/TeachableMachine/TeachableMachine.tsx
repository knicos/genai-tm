import React, { useRef, useState, useEffect } from "react";
import { TeachableMobileNet } from '@teachablemachine/image';
import { TrainingData } from "../../components/trainingdata/TrainingData";
import { Trainer } from "../../components/trainer/Trainer";
import { Preview } from "../../components/preview/Preview";
import { IClassification } from "../../state";
import style from "./TeachableMachine.module.css";
import { useTranslation } from "react-i18next";
import Output from "../../components/Output/Output";
import Behaviours, { BehaviourType } from "../../components/Behaviours/Behaviours";
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import IconButton from "@mui/material/IconButton";
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import SvgLayer, {ILine} from "./SvgLayer";

interface INode {
    x: number;
    y: number;
    width: number;
    height: number;
}

function extractNodesFromElements(div: HTMLElement, initial?: Map<string, INode[]>) {
    const result = initial || new Map<string, INode[]>();
    for (let i=0; i<div.children.length; ++i) {
        const child = div.children[i] as HTMLElement;
        const widgetType = child.getAttribute("data-widget");
        if (widgetType === "container") {
            extractNodesFromElements(child, result);
        } else if (widgetType) {
            if (!result.has(widgetType)) {
                result.set(widgetType, []);
            }
            const width = child.offsetWidth;
            const height = child.offsetHeight;
            if (width > 0 && height > 0) {
                result.get(widgetType)?.push({x: child.offsetLeft, y: child.offsetTop, width, height});
            }
        }
    }
    return result;
}

type ConnectionPoint = "left" | "right" | "top" | "bottom";

interface IConnection {
    start: string;
    startPoint: ConnectionPoint;
    end: string;
    endPoint: ConnectionPoint;
}

const connections: IConnection[] = [
    {start: "class", end: "trainer", startPoint: "right", endPoint: "left"},
    {start: "trainer", end: "model", startPoint: "right", endPoint: "left"},
    {start: "model", end: "output", startPoint: "right", endPoint: "left"},
    {start: "output", end: "behaviours", startPoint: "right", endPoint: "left"},
];

function generateLines(data: Map<string, INode[]>) {
    const lines: ILine[] = [];
    for (const connection of connections) {
        const ins = data.get(connection.start) || [];
        const outs = data.get(connection.end) || [];
        for (const input of ins) {
            for (const output of outs) {
                lines.push({
                    x1: (connection.startPoint === "left") ? input.x : (connection.startPoint === "right") ? input.x + input.width : input.x + input.width / 2,
                    x2: (connection.endPoint === "left") ? output.x : (connection.endPoint === "right") ? output.x + output.width : output.x + output.width / 2,
                    y1: (connection.startPoint === "top") ? input.y : (connection.startPoint === "bottom") ? input.y + input.height : input.y + input.height / 2,
                    y2: (connection.endPoint === "top") ? output.y : (connection.endPoint === "bottom") ? output.y + output.height : output.y + output.height / 2,
                });
            }
        }
    }
    return lines;
}

export function TeachableMachine() {
    const {t} = useTranslation();
    const [step, setStep] = useState(0);
    const [seenModel, setSeenModel] = useState(false);
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
                    setLines(generateLines(nodes));
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

    return <>
        <div className={style.workspace} ref={wkspaceRef}>
            <SvgLayer lines={lines} />
            <div className={style.container}>
                <TrainingData disabled={step > 0} data={data} setData={setData} active={true} />
                <Trainer disabled={step > 0} focus={step === 0} data={data} model={model} setModel={setModel} />
                <Preview model={model} onPrediction={setPred}/>
                {<Output hidden={!seenModel} focus={step === 1} disabled={step !== 1} predicted={pred} behaviours={behaviours} />}
                {<Behaviours hidden={!seenModel} disabled={step !== 1} classes={model?.getLabels() || []} behaviours={behaviours} setBehaviours={setBehaviours}/>}
            </div>
        </div>
        <div className={style.fixed}>
            <IconButton disabled={step <= 0} size="large" onClick={() => setStep(step - 1)}>
                <ArrowBackIosIcon fontSize="large" />
            </IconButton>
            <Stepper activeStep={step} >
                <Step>
                    <StepLabel>{t("stepper.labels.createModel")}</StepLabel>
                </Step>
                <Step disabled={!model}>
                    <StepLabel>{t("stepper.labels.deployModel")}</StepLabel>
                </Step>
            </Stepper>
            <IconButton disabled={step >= 1 || !model} size="large" onClick={() => {
                setStep(step + 1);
                setSeenModel(true);
            }}>
                <ArrowForwardIosIcon fontSize="large"/>
            </IconButton>
        </div>
    </>;
}
