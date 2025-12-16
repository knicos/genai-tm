
import { useState, useEffect, useRef } from 'react';
import { FormControlLabel, Switch } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';
import { modelState, modelTraining, modelStats, trainingHistory } from '../../state';
import { useVariant } from '@genaitm/util/variant';
import style from './SidePanel.module.css';
import { AccuracyPerClass, ConfusionMatrix, AccuracyPerEpoch, LossPerEpoch } from './Charts';

export function SidePanel() {
    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const model = useAtomValue(modelState);
    const training = useAtomValue(modelTraining);
    const stats = useAtomValue(modelStats);
    const history = useAtomValue(trainingHistory);
    const [enabled, setEnabled] = useState(true);

    const hasStats = stats.confusionMatrix && stats.confusionMatrix.length > 0;
    const hasHistory = history.length > 0;

    useEffect(() => {
        if (canvasRef.current && model) {
            if (enabled && model.isTrained()) {
                model.setXAICanvas(canvasRef.current);
            } else {
                model.explained = undefined;
            }
        }
    }, [model, enabled]);

    const canPredict = (model?.isTrained() || false) && !training;

    return (
        <div className={style.sidePanel}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ margin: 0 }}>
                    Under The Hood
                    {/* {t('sidePanel.title')} */}
                </h2>
            </div>
            <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>{t('heatmap.title')}</div>
                <FormControlLabel
                    control={
                        <Switch
                            checked={enabled}
                            onChange={(_, checked) => setEnabled(checked)}
                            color="error"
                            disabled={!canPredict}
                        />
                    }
                    label={enabled ? 'On' : 'Off'}
                />
            </div>
            {enabled && canPredict && (
                <div className={style.canvasContainer}>
                    <canvas
                        width={224}
                        height={224}
                        ref={canvasRef}
                        className={style.canvas}
                    />
                </div>
            )}

            {/* Model Statistics Charts */}
            {canPredict && (hasStats || hasHistory) && (
                <div className={style.statsSection}>
                    <h2 className={style.statsTitle}>Model Statistics</h2>

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
} export default SidePanel;
