import { useRef, useEffect, useState, useCallback } from 'react';
import { TrainingData } from '../TrainingData/TrainingData';
import Trainer from '../Trainer/Trainer';
import Preview from '../Preview/Preview';
import Output from '../Output/Output';
import Behaviours from '../../workflow/Behaviours/Behaviours';
import { useTranslation } from 'react-i18next';
import { classState, IClassification, saveState, p2pActive, sharingActive } from '../../state';
import style from './TeachableMachine.module.css';
import { useVariant } from '../../util/variant';
import Input from '../Input/Input';
import SaveDialog, { SaveProperties } from './SaveDialog';
import { ModelSaver } from './saver';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { ModelLoader } from './loader';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import DeployWrapper from './DeployWrapper';
import ExportDialog from './ExportDialog';
import { useModelCreator } from '../../util/TeachableModel';
import OpenDialog from './OpenDialog';
import CloneDialog from './CloneDialog';
import Heatmap from '../Heatmap/Heatmap';
import SvgLayer, { ILine } from '@genai-fi/base/main/components/WorkflowLayout/SvgLayer';
import { IConnection } from '@genai-fi/base';
import { extractNodesFromElements, generateLines } from '@genai-fi/base/main/components/WorkflowLayout/lines';

const SAVE_PERIOD = 5 * 60 * 1000; // 5 mins

const connections: IConnection[] = [
    { start: 'class', end: 'trainer', startPoint: 'right', endPoint: 'left' },
    { start: 'trainer', end: 'model', startPoint: 'right', endPoint: 'left' },
    { start: 'model', end: 'behaviour', startPoint: 'right', endPoint: 'left' },
    { start: 'behaviour', end: 'output', startPoint: 'right', endPoint: 'left' },
    { start: 'input', end: 'model', startPoint: 'bottom', endPoint: 'top' },
    { start: 'model', end: 'heatmap', startPoint: 'bottom', endPoint: 'top' },
];

interface Props {
    step: number;
    visitedStep: number;
    onComplete: (step: number) => void;
    saveTrigger?: () => void;
    onSkip: (step: number) => void;
    onSaveRemind: () => void;
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

export default function Workspace({ step, visitedStep, onComplete, saveTrigger, onSkip, onSaveRemind }: Props) {
    const { namespace, resetOnLoad, modelVariant, allowHeatmap } = useVariant();
    const { t } = useTranslation(namespace);
    const [data, setData] = useAtom(classState);
    const [lines, setLines] = useState<ILine[]>([]);
    const [errMsg, setErrMsg] = useState<string | null>(null);
    const setSaving = useSetAtom(saveState);
    const [editingData, setEditingData] = useState(false);
    const [showShare, setShowShare] = useState(false);
    const [showClone, setShowClone] = useState(false);
    const sharing = useAtomValue(sharingActive);
    const [, setP2PEnabled] = useAtom(p2pActive);

    // Ensure an initial model exists
    useModelCreator(modelVariant);

    const doCloseShare = useCallback(() => setShowShare(false), [setShowShare]);
    const doShare = useCallback(() => {
        setShowShare(true);
        setP2PEnabled(true);
    }, [setShowShare, setP2PEnabled]);
    const doClone = useCallback(() => {
        setShowClone(true);
        setP2PEnabled(true);
    }, [setShowShare, setP2PEnabled]);

    const observer = useRef<ResizeObserver>(undefined);
    const wkspaceRef = useRef<HTMLDivElement>(null);
    const saveTimer = useRef(-1);

    const closeError = useCallback(() => setErrMsg(null), [setErrMsg]);

    const doSetData = useCallback(
        (d: ((old: IClassification[]) => IClassification[]) | IClassification[]) => {
            addCloseAlert();
            if (saveTimer.current === -1) {
                setTimeout(onSaveRemind, SAVE_PERIOD);
            }
            setData(d);
        },
        [setData, onSaveRemind]
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
                    const lastNode = wkspaceRef.current.children[wkspaceRef.current.children.length - 1] as HTMLElement;
                    const nodes = extractNodesFromElements(lastNode);
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
        if (saveTimer.current === -1) {
            setTimeout(onSaveRemind, SAVE_PERIOD);
        }
        onComplete(1);
    }, [onComplete, onSaveRemind]);

    const doBehaviourChange = useCallback(() => {
        addCloseAlert();
        if (saveTimer.current === -1) {
            setTimeout(onSaveRemind, SAVE_PERIOD);
        }
    }, [onSaveRemind]);

    const doSaved = useCallback(() => {
        window.removeEventListener('beforeunload', alertMessage);
        if (saveTimer.current !== -1) {
            clearTimeout(saveTimer.current);
            saveTimer.current = -1;
        }
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
            <DeployWrapper />
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
                    <Preview
                        onExport={doShare}
                        onClone={doClone}
                    />
                    {allowHeatmap && modelVariant === 'image' && <Heatmap />}
                </div>
                <Behaviours
                    hidden={visitedStep < 1}
                    focus={step === 1}
                    onChange={doBehaviourChange}
                />
                <Output hidden={visitedStep < 1} />
            </div>

            <SaveDialog
                trigger={saveTrigger}
                onSave={doSave}
            />
            <OpenDialog />
            <ExportDialog
                open={showShare}
                onClose={doCloseShare}
                ready={sharing}
            />
            <CloneDialog
                open={showClone}
                onClose={() => setShowClone(false)}
                ready={sharing}
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
