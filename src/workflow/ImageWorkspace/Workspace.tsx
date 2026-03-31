import { useRef, useEffect, useState, useCallback } from 'react';
import { TrainingData } from '../TrainingData/TrainingData';
import Trainer from '../Trainer/Trainer';
import Preview from '../Preview/Preview';
import Output from '../Output/Output';
import Behaviours from '../../workflow/Behaviours/Behaviours';
import { useTranslation } from 'react-i18next';
import { classState, IClassification, saveState, inputImage, prediction, predictedIndex } from '../../state';
import style from './TeachableMachine.module.css';
import { useVariant } from '../../util/variant';
import Input from '../Input/Input';
import SaveDialog, { SaveProperties } from './SaveDialog';
import { ModelSaver } from './saver';
import { useAtom, useSetAtom } from 'jotai';
import { ModelLoader } from './loader';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import DeployWrapper from './DeployWrapper';
import ExportDialog from './ExportDialog';
import { useModelCreator } from '../../util/TeachableModel';
import OpenDialog from './OpenDialog';
import CloneDialog from './CloneDialog';
import { IConnection, WorkflowLayout, SidePanel } from '@genai-fi/base';
import UnderTheHood from '../../views/UnderTheHood/UnderTheHood';

const SAVE_PERIOD = 5 * 60 * 1000; // 5 mins

const CONNECTIONS: IConnection[] = [
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
    const { namespace, resetOnLoad, modelVariant } = useVariant();
    const { t } = useTranslation(namespace);
    const [data, setData] = useAtom(classState);
    const [errMsg, setErrMsg] = useState<string | null>(null);
    const setSaving = useSetAtom(saveState);
    const setInputImage = useSetAtom(inputImage);
    const setPrediction = useSetAtom(prediction);
    const setPredictedIndex = useSetAtom(predictedIndex);
    const [editingData, setEditingData] = useState(false);
    const [showShare, setShowShare] = useState(false);
    const [showClone, setShowClone] = useState(false);
    const [showSidebar, setShowSidebar] = useState(false);
    const lastVariantRef = useRef(modelVariant);

    // Ensure an initial model exists
    useModelCreator(modelVariant);

    // Clear samples when model variant changes (pose <-> image)
    useEffect(() => {
        if (lastVariantRef.current !== modelVariant) {
            // Clear all samples when switching between model types
            setData((classes) => classes.map((cls) => ({ ...cls, samples: [] })));
            // Clear test input image and predictions
            setInputImage(null);
            setPrediction([]);
            setPredictedIndex(-1);
            // Close Actions sidebar
            setShowSidebar(false);
            lastVariantRef.current = modelVariant;
        }
    }, [modelVariant, setData, setInputImage, setPrediction, setPredictedIndex]);

    // Set default sidebar width to 400px
    useEffect(() => {
        if (!window.sessionStorage.getItem('sidePanelWidth')) {
            window.sessionStorage.setItem('sidePanelWidth', '400');
        }
    }, []);

    const doCloseShare = useCallback(() => setShowShare(false), []);
    const doShare = useCallback(() => {
        setShowShare(true);
    }, []);
    const doClone = useCallback(() => {
        setShowClone(true);
    }, []);
    const doSidebar = useCallback(() => {
        setShowSidebar(true);
    }, []);

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
        <main className={style.workspace}>
            <DeployWrapper />
            <ModelLoader
                onLoaded={doLoaded}
                onError={doLoadError}
            />
            <ModelSaver onSaved={doSaved} />
            <div className={style.workspaceContent}>
                <WorkflowLayout
                    connections={CONNECTIONS}
                    ignoredColumns={visitedStep < 1 ? 2 : 0}
                >
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
                            onSidebar={doSidebar}
                        />
                    </div>
                    <Behaviours
                        hidden={visitedStep < 1}
                        focus={step === 1}
                        onChange={doBehaviourChange}
                    />
                    <Output hidden={visitedStep < 1} />
                </WorkflowLayout>
            </div>
            <SidePanel
                open={showSidebar}
                position="right"
                onClose={() => setShowSidebar(false)}
            >
                <UnderTheHood />
            </SidePanel>

            <SaveDialog
                trigger={saveTrigger}
                onSave={doSave}
            />
            <OpenDialog />
            <ExportDialog
                open={showShare}
                onClose={doCloseShare}
                ready={true}
            />
            <CloneDialog
                open={showClone}
                onClose={() => setShowClone(false)}
                ready={true}
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
