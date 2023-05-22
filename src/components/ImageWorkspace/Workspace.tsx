import React, { useRef, useEffect, useState, useCallback } from 'react';
import SvgLayer, { ILine } from './SvgLayer';
import { TrainingData } from '../trainingdata/TrainingData';
import Trainer from '../trainer/Trainer';
import Preview from '../preview/Preview';
import { IConnection, extractNodesFromElements, generateLines } from './lines';
import Output from '../Output/Output';
import Behaviours from '../Behaviours/Behaviours';
import { useTranslation } from 'react-i18next';
import { classState, IClassification, saveState, sharingActive } from '../../state';
import style from './TeachableMachine.module.css';
import { useVariant } from '../../util/variant';
import Input from '../Input/Input';
import SaveDialog, { SaveProperties } from './SaveDialog';
import { ModelSaver } from './saver';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { ModelLoader } from './loader';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import PeerDeployer from '../PeerDeployer/PeerDeployer';
import Deployer from '../Deployer/Deployer';
import ExportDialog from './ExportDialog';
import { useModelCreator } from '../../util/TeachableModel';

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
    const { namespace, resetOnLoad, usep2p, modelVariant } = useVariant();
    const { t } = useTranslation(namespace);
    const [data, setData] = useRecoilState(classState);
    const [lines, setLines] = useState<ILine[]>([]);
    const [errMsg, setErrMsg] = useState<string | null>(null);
    const setSaving = useSetRecoilState(saveState);
    const [editingData, setEditingData] = useState(false);
    const [showShare, setShowShare] = useState(false);
    const sharing = useRecoilValue(sharingActive);

    // Ensure an initial model exists
    useModelCreator(modelVariant);

    const doCloseShare = useCallback(() => setShowShare(false), [setShowShare]);
    const doShare = useCallback(() => setShowShare(true), [setShowShare]);

    const observer = useRef<ResizeObserver>();
    const wkspaceRef = useRef<HTMLDivElement>(null);

    const closeError = useCallback(() => setErrMsg(null), [setErrMsg]);

    const doSetData = useCallback(
        (d: ((old: IClassification[]) => IClassification[]) | IClassification[]) => {
            addCloseAlert();
            setData(d);
        },
        [setData]
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

    const doTrained = useCallback(() => {
        addCloseAlert();
        onComplete(1);
    }, [onComplete]);

    const doSaved = useCallback(() => {
        window.removeEventListener('beforeunload', alertMessage);
        hasAlert = false;
    }, []);

    const doSave = useCallback(
        (props: SaveProperties) => {
            setSaving(props);
        },
        [setSaving]
    );

    const doLoadError = useCallback(
        (e: unknown) => {
            setErrMsg('Could not load model');
            console.log(e);
        },
        [setErrMsg]
    );

    const doLoaded = useCallback(
        (hadBehaviours: boolean) => {
            if (hadBehaviours && !resetOnLoad) {
                onSkip(1);
            }
        },
        [onSkip, resetOnLoad]
    );

    return (
        <main
            className={style.workspace}
            ref={wkspaceRef}
        >
            {usep2p && <PeerDeployer />}
            {!usep2p && <Deployer />}
            <ModelLoader
                onLoaded={doLoaded}
                onError={doLoadError}
            />
            <ModelSaver onSaved={doSaved} />
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
                    editing={editingData}
                    onTrained={doTrained}
                />
                <div
                    className={style.column}
                    data-widget="container"
                >
                    <Input />
                    <Preview onExport={sharing ? doShare : undefined} />
                </div>
                <Behaviours
                    hidden={visitedStep < 1}
                    focus={step === 1}
                    onChange={addCloseAlert}
                />
                <Output hidden={visitedStep < 1} />
            </div>

            <SaveDialog
                trigger={saveTrigger}
                onSave={doSave}
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
