import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';
import { modelState, modelTraining, modelStats, trainingHistory, poseDetected as poseDetectedAtom } from '../../state';
import { useVariant } from '@genaitm/util/variant';
import { getXAI, isXAICopied, markXAICopied } from '../../util/xaiCanvas';
import style from './UnderTheHood.module.css';
import { AccuracyPerClass } from './AccuracyPerClass';
import { ConfusionMatrix } from './ConfusionMatrix';
import { AccuracyPerEpoch } from './AccuracyPerEpoch';
import { LossPerEpoch } from './LossPerEpoch';
import { HeatmapPanel } from './HeatmapPanel';

export function UnderTheHood() {
    const { namespace, modelVariant } = useVariant();
    const { t } = useTranslation(namespace);
    const model = useAtomValue(modelState);
    const training = useAtomValue(modelTraining);
    const stats = useAtomValue(modelStats);
    const history = useAtomValue(trainingHistory);
    const poseDetected = useAtomValue(poseDetectedAtom);
    const [enabled, setEnabled] = useState(true);

    const hasStats = stats.confusionMatrix && stats.confusionMatrix.length > 0;
    const hasHistory = history.length > 0;
    const canPredict = (model?.isTrained() || false) && !training;
    const imageSize = model?.getImageSize();

    const displayCanvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        if (!enabled || !canPredict) return;
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
                <h2 className={style.title}>{t('underTheHood.title')}</h2>
            </div>
            <HeatmapPanel
                enabled={enabled}
                canPredict={canPredict}
                onToggle={handleToggle}
                canvasRef={handleCanvasRef}
                size={imageSize}
                poseDetected={modelVariant === 'pose' ? poseDetected : null}
            />
            {canPredict && (hasStats || hasHistory) && (
                <div className={style.statsSection}>
                    <h2 className={style.statsTitle}>{t('underTheHood.statistics')}</h2>
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
                </div>
            )}
        </div>
    );
}

export default UnderTheHood;
