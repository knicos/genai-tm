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
import { fileData, IClassification } from "../../state";
import style from "./TeachableMachine.module.css";
import { useVariant } from "../../util/variant";
import Input from "../Input/Input";
import SaveDialog, { SaveProperties } from "./SaveDialog";
import { saveProject } from "./saver";
import { useRecoilValue } from "recoil";
import { loadProject } from "./loader";
import { Alert, Snackbar } from "@mui/material";

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
    onSkip: (step: number) => void;
}

function alertMessage(e: Event) {
    e.returnValue = true;
    return "";
}

let hasAlert = false;
function addCloseAlert() {
    if (!hasAlert) {
        hasAlert = true;
        window.addEventListener("beforeunload", alertMessage);
    }
}

export default function Workspace({step, visitedStep, onComplete, saveTrigger, onSkip}: Props) {
    const {namespace} = useVariant();
    const {t} = useTranslation(namespace);
    const projectFile = useRecoilValue(fileData);
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
    const [errMsg, setErrMsg] = useState<string | null>(null);

    const observer = useRef<ResizeObserver>();
    const wkspaceRef = useRef<HTMLDivElement>(null);

    const closeError = useCallback(() => setErrMsg(null), [setErrMsg]);

    useEffect(() => {
        if (projectFile) {
            loadProject(projectFile).then((project) => {
                setModel(project.model);
                if (project.behaviours) setBehaviours(project.behaviours);
                if (project.samples) setData(project.samples);
                if (project.behaviours) {
                    onSkip(1);
                }
            }).catch((e) => {
                setErrMsg("Could not load model file");
                console.error(e);
            });
        }
    }, [projectFile, onSkip]);

    const doSetModel = useCallback((model: TeachableMobileNet | undefined) => {
        addCloseAlert();
        setModel(model);
    }, [setModel]);

    const doSetData = useCallback((d: IClassification[]) => {
        addCloseAlert();
        setData(d);
    }, [setData]);

    const doSetBehaviours = useCallback((b: BehaviourType[]) => {
        addCloseAlert();
        setBehaviours(b);
    }, [setBehaviours]);

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
        ).then(() => {
            window.removeEventListener("beforeunload", alertMessage);
            hasAlert = false;
        });
    }, [behaviours, model, data]);

    return <div className={style.workspace} ref={wkspaceRef}>
        <SvgLayer lines={lines} />
        <div className={style.container}>
            <TrainingData disabled={step > 0} data={data} setData={doSetData} active={true} />
            <Trainer disabled={step > 0} focus={step === 0} data={data} model={model} setModel={doSetModel} />
            <div className={style.column} data-widget="container">
                <Input onCapture={doPrediction} enabled={!!model} />
                <Preview model={model} prediction={lastPrediction} />
            </div>
            <Behaviours hidden={visitedStep < 1} focus={step === 1} disabled={step !== 1} classes={model?.getLabels() || []} behaviours={behaviours} setBehaviours={doSetBehaviours}/>
            <Output hidden={visitedStep < 1} disabled={step !== 1} predicted={pred} behaviours={behaviours} />
        </div>

        <SaveDialog trigger={saveTrigger} onSave={doSave} hasModel={!!model} />
        <Snackbar anchorOrigin={{ vertical: "top", horizontal: "center" }} open={!!errMsg} autoHideDuration={6000} onClose={closeError}>
            <Alert onClose={closeError} severity="error">{errMsg}</Alert>
        </Snackbar>
    </div>;
}