import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as tf from '@tensorflow/tfjs';
import SvgLayer, { ILine } from './SvgLayer';
import { TrainingData } from '../trainingdata/TrainingData';
import Trainer from '../trainer/Trainer';
import Preview from '../preview/Preview';
import { IConnection, extractNodesFromElements, generateLines } from './lines';
import Output from '../Output/Output';
import Behaviours, { BehaviourType } from '../Behaviours/Behaviours';
import { useTranslation } from 'react-i18next';
import { TeachableMobileNet, createTeachable } from '@teachablemachine/image';
import { behaviourState, classState, fileData, IClassification, modelState, saveState } from '../../state';
import style from './TeachableMachine.module.css';
import { useVariant } from '../../util/variant';
import Input from '../Input/Input';
import SaveDialog, { SaveProperties } from './SaveDialog';
import { saveProject } from './saver';
import { useRecoilState, useRecoilValue } from 'recoil';
import { loadProject } from './loader';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import PeerDeployer from '../PeerDeployer/PeerDeployer';
import { patchBehaviours } from '../Behaviours/patch';
import Deployer from '../Deployer/Deployer';
import ExportDialog from './ExportDialog';
import { sessionCode, sharingActive } from '../../state';

const connections: IConnection[] = [
    { start: 'class', end: 'trainer', startPoint: 'right', endPoint: 'left' },
    { start: 'trainer', end: 'model', startPoint: 'right', endPoint: 'left' },
    { start: 'model', end: 'behaviour', startPoint: 'right', endPoint: 'left' },
    { start: 'behaviour', end: 'output', startPoint: 'right', endPoint: 'left' },
    { start: 'input', end: 'model', startPoint: 'bottom', endPoint: 'top' },
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
    return '';
}

let hasAlert = false;
function addCloseAlert() {
    if (!hasAlert) {
        hasAlert = true;
        window.addEventListener('beforeunload', alertMessage);
    }
}

export default function Workspace({ step, visitedStep, onComplete, saveTrigger, onSkip }: Props) {
    const { namespace, resetOnLoad, usep2p } = useVariant();
    const { t } = useTranslation(namespace);
    const [projectFile, setProjectFile] = useRecoilState(fileData);
    const [behaviours, setBehaviours] = useRecoilState(behaviourState);
    const [model, setModel] = useRecoilState(modelState);
    const [data, setData] = useRecoilState(classState);
    const [lines, setLines] = useState<ILine[]>([]);
    const [errMsg, setErrMsg] = useState<string | null>(null);
    const [saving, setSaving] = useRecoilState(saveState);
    const [editingData, setEditingData] = useState(false);
    const [showShare, setShowShare] = useState(false);
    const [code, setCode] = useRecoilState(sessionCode);
    const sharing = useRecoilValue(sharingActive);

    const doCloseShare = useCallback(() => setShowShare(false), [setShowShare]);
    const doShare = useCallback(() => setShowShare(true), [setShowShare]);

    const observer = useRef<ResizeObserver>();
    const wkspaceRef = useRef<HTMLDivElement>(null);

    const closeError = useCallback(() => setErrMsg(null), [setErrMsg]);

    // Cache the model on load
    useEffect(() => {
        createTeachable({ tfjsVersion: tf.version.tfjs }, { version: 2, alpha: 0.35 });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (projectFile) {
            loadProject(projectFile)
                .then((project) => {
                    if (project.id) {
                        setCode(project.id);
                    }
                    setModel(project.model);
                    if (project.behaviours) setBehaviours(project.behaviours);
                    if (project.samples) setData(project.samples);
                    if (project.behaviours && !resetOnLoad) {
                        onSkip(1);
                    }
                    setProjectFile(null);
                })
                .catch((e) => {
                    setErrMsg('Could not load model file');
                    console.error(e);
                    setProjectFile(null);
                });
        }
    }, [projectFile, onSkip, setBehaviours, setData, setModel, setProjectFile, resetOnLoad, setCode]);

    const doSetModel = useCallback(
        (model: TeachableMobileNet | undefined) => {
            addCloseAlert();
            setModel(model);
            setBehaviours(patchBehaviours(behaviours, model?.getLabels() || []));
        },
        [setModel, setBehaviours, behaviours]
    );

    const doSetData = useCallback(
        (d: IClassification[]) => {
            addCloseAlert();
            setData(d);
        },
        [setData]
    );

    const doSetBehaviours = useCallback(
        (b: BehaviourType[]) => {
            addCloseAlert();
            setBehaviours(b);
        },
        [setBehaviours]
    );

    useEffect(() => {
        if (data.length === 0) {
            setData([
                {
                    label: `${t('trainingdata.labels.class')} 1`,
                    samples: [],
                },
                {
                    label: `${t('trainingdata.labels.class')} 2`,
                    samples: [],
                },
            ]);
        }
        if (wkspaceRef.current) {
            observer.current = new ResizeObserver(() => {
                if (wkspaceRef.current) {
                    const nodes = extractNodesFromElements(wkspaceRef.current.children[0] as HTMLElement);
                    setLines(generateLines(nodes, connections));
                }
            });
            observer.current.observe(wkspaceRef.current);
            const children = wkspaceRef.current.children[0]?.children;
            if (children) {
                for (let i = 0; i < children.length; ++i) {
                    const child = children[i];
                    observer.current.observe(child);
                }
            }
            return () => {
                observer.current?.disconnect();
            };
        }
    }, []);

    useEffect(() => {
        if (model) onComplete(1);
    }, [model, onComplete]);

    useEffect(() => {
        if (saving) {
            saveProject(
                'my-classifier.zip',
                code,
                model,
                saving.behaviours ? behaviours : undefined,
                saving.samples ? data : undefined
            ).then(() => {
                window.removeEventListener('beforeunload', alertMessage);
                hasAlert = false;
                setSaving(null);
            });
        }
    }, [saving, model, behaviours, data, setSaving, code]);

    const doSave = useCallback(
        (props: SaveProperties) => {
            setSaving(props);
        },
        [setSaving]
    );

    return (
        <main
            className={style.workspace}
            ref={wkspaceRef}
        >
            {usep2p && (
                <PeerDeployer
                    model={model}
                    behaviours={behaviours}
                />
            )}
            {!usep2p && (
                <Deployer
                    model={model}
                    behaviours={behaviours}
                />
            )}
            <div className={visitedStep < 1 ? style.container3 : style.container5}>
                <SvgLayer lines={lines} />
                <TrainingData
                    data={data}
                    setData={doSetData}
                    active={true}
                    onFocused={setEditingData}
                />
                <Trainer
                    focus={step === 0}
                    data={data}
                    model={model}
                    editing={editingData}
                    setModel={doSetModel}
                />
                <div
                    className={style.column}
                    data-widget="container"
                >
                    <Input
                        enabled={!!model}
                        model={model}
                    />
                    <Preview
                        model={!!model}
                        onExport={sharing ? doShare : undefined}
                    />
                </div>
                <Behaviours
                    hidden={visitedStep < 1}
                    focus={step === 1}
                    classes={model?.getLabels() || []}
                    behaviours={behaviours}
                    setBehaviours={doSetBehaviours}
                />
                <Output
                    hidden={visitedStep < 1}
                    behaviours={behaviours}
                />
            </div>

            <SaveDialog
                trigger={saveTrigger}
                onSave={doSave}
                hasModel={!!model}
            />
            <ExportDialog
                open={showShare}
                onClose={doCloseShare}
            />
            <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                open={!!errMsg}
                autoHideDuration={6000}
                onClose={closeError}
            >
                <Alert
                    onClose={closeError}
                    severity="error"
                >
                    {errMsg}
                </Alert>
            </Snackbar>
        </main>
    );
}
