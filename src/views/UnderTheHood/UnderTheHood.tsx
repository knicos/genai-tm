import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAtom, useAtomValue } from 'jotai';
import { modelState, modelTraining, modelStats, trainingHistory, poseDetected as poseDetectedAtom, xaiEnabled } from '../../state';
import { useVariant } from '@genaitm/util/variant';
import { getXAI, isXAICopied, markXAICopied, markXAIUncopied } from '../../util/xaiCanvas';
import style from './UnderTheHood.module.css';
import { AccuracyPerClass } from './AccuracyPerClass';
import { ConfusionMatrix } from './ConfusionMatrix';
import { AccuracyPerEpoch } from './AccuracyPerEpoch';
import { LossPerEpoch } from './LossPerEpoch';
import { HeatmapPanel } from './HeatmapPanel';
import { SidebarMode } from '../../workflow/Preview/PreviewMenu';
import { PretrainedStatistics } from './PretrainedStatistics';
import { TransferLearningMatrix } from './TransferLearningMatrix';
import { TransferLearningGraph } from './TransferLearningGraph';

interface Props {
    mode?: SidebarMode;
}

export function UnderTheHood({ mode }: Props) {
    const { namespace, modelVariant } = useVariant();
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
    const canXAI = canPredict && modelVariant !== 'speech';

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
                <h2 className={style.title}>
                    {showStatistics ? t('underTheHood.statistics') : t('underTheHood.title')}
                </h2>
            </div>
            {showVisualization && (
                <>
                    {canXAI && (
                        <HeatmapPanel
                            enabled={enabled}
                            canPredict={canPredict}
                            onToggle={handleToggle}
                            canvasRef={handleCanvasRef}
                            size={imageSize}
                            poseDetected={modelVariant === 'pose' ? poseDetected : null}
                        />
                    )}
                    {modelVariant === 'image' && (
                        <>
                            <PretrainedStatistics />
                            {canPredict && (
                                <>
                                    <TransferLearningMatrix />
                                    <TransferLearningGraph />
                                </>
                            )}
                        </>
                    )}
                </>
            )}
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
        </div>
    );
}

export default UnderTheHood;
