import { useRef, useEffect, useState, useCallback } from 'react';
import { useOutlet, useLocation } from 'react-router';
import { TrainingData } from '../TrainingData/TrainingData';
import Trainer from '../Trainer/Trainer';
import Preview from '../Preview/Preview';
import Output from '../Output/Output';
import Behaviours from '../../workflow/Behaviours/Behaviours';
import { useTranslation } from 'react-i18next';
import {
    classState,
    classLabelModifiedState,
    behaviourState,
    IClassification,
    saveState,
    inputImage,
    prediction,
    predictedIndex,
    xaiEnabled,
    featureFlagsAtom,
} from '../../state';
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
import { useModelCreator, useXAICanvas } from '../../util/TeachableModel';
import { useWorkspaceRoute } from '../../util/useWorkspaceRoute';
import useOrientation from '../../util/useOrientation';
import OpenDialog from './OpenDialog';
import CloneDialog from './CloneDialog';
import { IConnection, WorkflowLayout, SidePanel } from '@genai-fi/base';
import BoxButton from '@genai-fi/base/components/BoxButton';
import type { SidebarMode } from '../Preview/PreviewMenu';
import InsertChartOutlinedIcon from '@mui/icons-material/InsertChartOutlined';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import DeviceHubIcon from '@mui/icons-material/DeviceHub';

const SAVE_PERIOD = 5 * 60 * 1000; // 5 mins

const CONNECTIONS: IConnection[] = [
    { start: 'class', end: 'trainer', startPoint: 'right', endPoint: 'left' },
    { start: 'trainer', end: 'model', startPoint: 'right', endPoint: 'left' },
    { start: 'model', end: 'behaviour', startPoint: 'right', endPoint: 'left' },
    { start: 'behaviour', end: 'output', startPoint: 'right', endPoint: 'left' },
    { start: 'input', end: 'model', startPoint: 'bottom', endPoint: 'top' },
    { start: 'model', end: 'statistics', startPoint: 'bottom', endPoint: 'top' },
    { start: 'model', end: 'heatmap', startPoint: 'bottom', endPoint: 'top' },
    { start: 'model', end: 'transferLearning', startPoint: 'bottom', endPoint: 'top' },
];

const CONNECTIONS_NO_TL = CONNECTIONS.filter(({ end }) => end !== 'transferLearning');

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
    const { allowTransferLearning } = useAtomValue(featureFlagsAtom);
    const { t, i18n } = useTranslation(namespace);
    const [data, setData] = useAtom(classState);
    const [labelModified, setLabelModified] = useAtom(classLabelModifiedState);
    const [errMsg, setErrMsg] = useState<string | null>(null);
    const setSaving = useSetAtom(saveState);
    const setInputImage = useSetAtom(inputImage);
    const setPrediction = useSetAtom(prediction);
    const setPredictedIndex = useSetAtom(predictedIndex);
    const setBehaviours = useSetAtom(behaviourState);
    const [editingData, setEditingData] = useState(false);
    const [showShare, setShowShare] = useState(false);
    const [showClone, setShowClone] = useState(false);
    const outlet = useOutlet();
    const location = useLocation();
    const { closeSidebar, openSidebar } = useWorkspaceRoute();
    const orientation = useOrientation();
    const showSidebar = !!outlet;
    const heatmapEnabled = useAtomValue(xaiEnabled);
    const lastVariantRef = useRef(modelVariant);
    const canShowTransferLearning = modelVariant === 'image' && allowTransferLearning;
    const connections = canShowTransferLearning ? CONNECTIONS : CONNECTIONS_NO_TL;
    const sidePanelPosition = orientation === 'portrait' ? 'bottom' : 'right';

    const getDefaultLabel = useCallback(
        (index: number, variant: string) => {
            const noiseLabel = t('trainingdata.labels.noiseClass');
            const classLabel = t('trainingdata.labels.class');
            if (variant === 'speech') {
                return index === 0 ? noiseLabel : `${classLabel} ${index}`;
            }
            return `${classLabel} ${index + 1}`;
        },
        [t]
    );

    // Ensure an initial model exists
    useModelCreator(modelVariant);
    useXAICanvas(showSidebar && location.pathname.endsWith('/visualization') && heatmapEnabled && !!allowHeatmap);

    // Clear samples when model variant changes
    useEffect(() => {
        if (lastVariantRef.current !== modelVariant) {
            // Clear all samples when switching between model types
            setLabelModified((classes) => classes.map(() => false));
            setData((classes) => {
                const nextClasses = classes.map((cls, index) => {
                    return { ...cls, label: getDefaultLabel(index, modelVariant), samples: [] };
                });
                setBehaviours(
                    nextClasses.map((cls) => ({
                        label: cls.label,
                        text: { text: cls.label },
                    }))
                );
                return nextClasses;
            });
            // Clear test input image and predictions
            setInputImage(null);
            setPrediction([]);
            setPredictedIndex(-1);
            // Close Actions sidebar
            closeSidebar();
            lastVariantRef.current = modelVariant;
        }
    }, [
        modelVariant,
        setData,
        setLabelModified,
        setInputImage,
        setPrediction,
        setPredictedIndex,
        setBehaviours,
        closeSidebar,
        getDefaultLabel,
    ]);

    useEffect(() => {
        setData((classes) => {
            let changed = false;
            const nextClasses = classes.map((cls, index) => {
                if (labelModified[index]) return cls;
                const nextLabel = getDefaultLabel(index, modelVariant);
                if (nextLabel === cls.label) return cls;
                changed = true;
                return { ...cls, label: nextLabel };
            });
            return changed ? nextClasses : classes;
        });
    }, [i18n.language, modelVariant, labelModified, setData, getDefaultLabel]);

    // Set default sidebar width to 400px
    useEffect(() => {
        if (!window.sessionStorage.getItem('sidePanelWidth')) {
            window.sessionStorage.setItem('sidePanelWidth', '400');
        }
    }, []);

    const doCloseShare = useCallback(() => setShowShare(false), [setShowShare]);
    const doShare = useCallback(() => {
        setShowShare(true);
    }, [setShowShare]);
    const doClone = useCallback(() => {
        setShowClone(true);
    }, [setShowClone]);
    const doSidebar = useCallback(
        (mode: SidebarMode) => {
            openSidebar(mode);
        },
        [openSidebar]
    );

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
                    label: getDefaultLabel(0, modelVariant),
                    samples: [],
                },
                {
                    label: getDefaultLabel(1, modelVariant),
                    samples: [],
                },
            ]);
            setLabelModified([false, false]);
        }
    }, [data.length, setData, modelVariant, getDefaultLabel, setLabelModified]);

    useEffect(() => {
        setLabelModified((old) => {
            if (old.length === data.length) return old;
            return data.map((cls, index) => {
                if (index < old.length) return old[index];
                return cls.label !== getDefaultLabel(index, modelVariant);
            });
        });
    }, [data, setLabelModified, getDefaultLabel, modelVariant]);

    const doLabelEdited = useCallback(
        (index: number) => {
            setLabelModified((old) => {
                if (old[index]) return old;
                const next = [...old];
                while (next.length <= index) next.push(false);
                next[index] = true;
                return next;
            });
        },
        [setLabelModified]
    );

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
            style={{ flexDirection: sidePanelPosition === 'bottom' ? 'column' : 'row' }}
        >
            <DeployWrapper />
            <ModelLoader
                onLoaded={doLoaded}
                onError={doLoadError}
            />
            <ModelSaver onSaved={doSaved} />
            <div className={style.workspaceContent}>
                <WorkflowLayout
                    connections={connections}
                    ignoredColumns={visitedStep < 1 ? 2 : 0}
                >
                    <TrainingData
                        data={data}
                        setData={doSetData}
                        active={true}
                        onFocused={setEditingData}
                        onLabelEdited={doLabelEdited}
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
                        <div className={style.previewActions}>
                            <BoxButton
                                label={'Statistics'}
                                icon={<InsertChartOutlinedIcon />}
                                widget={'statistics'}
                                onClick={() => doSidebar('statistics')}
                                style={{ width: 68, height: 68 }}
                            />
                            <BoxButton
                                label={'Heatmap'}
                                icon={<LocalFireDepartmentIcon />}
                                widget={'heatmap'}
                                onClick={() => doSidebar('visualization')}
                                style={{ width: 68, height: 68 }}
                            />
                            {canShowTransferLearning && (
                                <BoxButton
                                    label={'Transfer Learning'}
                                    icon={<DeviceHubIcon />}
                                    widget={'transferLearning'}
                                    onClick={() => doSidebar('transferLearning')}
                                    style={{ width: 68, height: 68 }}
                                />
                            )}
                        </div>
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
                position={sidePanelPosition}
                onClose={closeSidebar}
                dark
            >
                {outlet}
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
