import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAtom, useAtomValue } from 'jotai';
import {
    modelState,
    modelTraining,
    modelStats,
    trainingHistory,
    poseDetected as poseDetectedAtom,
    xaiEnabled,
    featureFlagsAtom,
} from '../../state';
import { useVariant } from '@genaitm/util/variant';
import { getXAI, isXAICopied, markXAICopied, markXAIUncopied } from '../../util/xaiCanvas';
import style from './UnderTheHood.module.css';
import { AccuracyPerClass } from './Statistics/AccuracyPerClass';
import { ConfusionMatrix } from './Statistics/ConfusionMatrix';
import { AccuracyPerEpoch } from './Statistics/AccuracyPerEpoch';
import { LossPerEpoch } from './Statistics/LossPerEpoch';
import { HeatmapPanel } from './Heatmap/HeatmapPanel';
import { TransferLearningStages } from './TransferLearning/TransferLearningStages';
import type { SidebarMode } from '../../workflow/Preview/PreviewMenu';
import { Alert } from '@mui/material';

interface Props {
    mode: SidebarMode;
}

const titleKeyByMode: Record<SidebarMode, string> = {
    visualization: 'underTheHood.visualization',
    statistics: 'underTheHood.statistics',
    transferLearning: 'underTheHood.transferLearning',
};

export function UnderTheHood({ mode }: Props) {
    const { namespace, modelVariant, allowHeatmap } = useVariant();
    const { allowTransferLearning } = useAtomValue(featureFlagsAtom);
    const { t } = useTranslation(namespace);
    const model = useAtomValue(modelState);
    const training = useAtomValue(modelTraining);
    const stats = useAtomValue(modelStats);
    const history = useAtomValue(trainingHistory);
    const poseDetected = useAtomValue(poseDetectedAtom);
    const [enabled, setEnabled] = useAtom(xaiEnabled);

    const hasStats = stats.confusionMatrix && stats.confusionMatrix.length > 0;
    const hasHistory = history.length > 0;
    const canPredict = (model?.isTrained() || false) && !training;
    const imageSize = model?.getImageSize();
    const showVisualization = mode === 'visualization';
    const showStatistics = mode === 'statistics';
    const showTransferLearning = mode === 'transferLearning';
    const canXAI = canPredict && modelVariant !== 'speech' && allowHeatmap;
    const canShowTransferLearning =
        showTransferLearning && modelVariant === 'image' && canPredict && allowTransferLearning;

    const displayCanvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        if (!enabled || !canPredict) return;
        // Force redraw of the last heatmap when the panel is (re)opened.
        markXAIUncopied();
        let animId: number;
        const loop = () => {
            const display = displayCanvasRef.current;
            if (display && !isXAICopied()) {
                const dctx = display.getContext('2d');
                if (dctx) {
                    dctx.clearRect(0, 0, display.width, display.height);
                    dctx.drawImage(getXAI().element, 0, 0);
                }
                markXAICopied();
            }
            animId = requestAnimationFrame(loop);
        };
        animId = requestAnimationFrame(loop);
        return () => cancelAnimationFrame(animId);
    }, [enabled, canPredict]);

    const handleCanvasRef = (canvas: HTMLCanvasElement | null) => {
        displayCanvasRef.current = canvas;
    };

    const handleToggle = (checked: boolean) => {
        setEnabled(checked);
    };

    return (
        <div className={style.underTheHood}>
            <div className={style.header}>
                <h2 className={style.title}>{t(titleKeyByMode[mode])}</h2>
            </div>
            {showStatistics && canPredict && (hasStats || hasHistory) && (
                <>
                    {hasStats && (
                        <>
                            <AccuracyPerClass />
                            <ConfusionMatrix />
                        </>
                    )}
                    {hasHistory && (
                        <>
                            <AccuracyPerEpoch />
                            <LossPerEpoch />
                        </>
                    )}
                </>
            )}
            {showVisualization && canXAI && (
                <HeatmapPanel
                    enabled={enabled}
                    canPredict={canPredict}
                    onToggle={handleToggle}
                    canvasRef={handleCanvasRef}
                    size={imageSize}
                    poseDetected={modelVariant === 'pose' ? poseDetected : null}
                />
            )}
            {showVisualization && !canXAI && <Alert severity="info">{t('model.labels.mustTrain')}</Alert>}
            {showStatistics && !canPredict && <Alert severity="info">{t('model.labels.mustTrain')}</Alert>}
            {canShowTransferLearning && <TransferLearningStages />}
        </div>
    );
}

export default UnderTheHood;
