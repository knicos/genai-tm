import { useMemo, useState } from 'react';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { modelStats } from '../../state';
import styles from './Charts.module.css';
import { useVariant } from '@genaitm/util/variant';
import { InfoPop } from '@genai-fi/base';

export function ConfusionMatrix() {
    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);
    const stats = useAtomValue(modelStats);
    const [hoveredCell, setHoveredCell] = useState<{
        row: number;
        col: number;
        value: number;
    } | null>(null);
    const [anchor, setAnchor] = useState<HTMLDivElement | null>(null);

    const maxValue = useMemo(() => {
        if (!stats.confusionMatrix) return 1;
        return Math.max(...stats.confusionMatrix.flat());
    }, [stats.confusionMatrix]);

    if (!stats.confusionMatrix || stats.confusionMatrix.length === 0) {
        return null;
    }

    return (
        <div className={styles.chartContainer}>
            <h3 className={styles.chartTitle}>{t('charts.confusionMatrix')}</h3>
            <div className={styles.matrixScrollWrapper}>
                <div className={styles.matrixContainer}>
                    <div className={styles.matrixHeaderRow}>
                        <div className={styles.matrixHeaderSpacer}></div>
                        <div className={styles.matrixHeaderTitle}>{t('charts.prediction')}</div>
                    </div>
                    <div className={styles.matrixContent}>
                        <div className={styles.matrixYAxisLabel}>{t('charts.class')}</div>
                        <div className={styles.matrixBody}>
                            <div className={styles.matrixColumnHeaders}>
                                <div className={styles.matrixColumnHeaderSpacer}></div>
                                {stats.labels.map((label, index) => (
                                    <div
                                        key={index}
                                        className={styles.matrixColumnHeader}
                                    >
                                        {label}
                                    </div>
                                ))}
                            </div>
                            {stats.confusionMatrix.map((row, rowIndex) => (
                                <div
                                    key={rowIndex}
                                    style={{ display: 'flex', marginBottom: '2px' }}
                                >
                                    <div className={styles.matrixRowHeader}>{stats.labels[rowIndex]}</div>
                                    {row.map((value, colIndex) => {
                                        const intensity = value / maxValue;
                                        const isCorrect = rowIndex === colIndex;
                                        const bgColor = isCorrect
                                            ? `rgba(33, 150, 243, ${0.2 + intensity * 0.8})`
                                            : `rgba(200, 200, 200, ${0.1 + intensity * 0.3})`;

                                        return (
                                            <div
                                                key={colIndex}
                                                className={styles.matrixCell}
                                                style={{
                                                    backgroundColor: bgColor,
                                                    fontWeight: value > 0 ? 'bold' : 'normal',
                                                }}
                                                onMouseEnter={(e) => {
                                                    setHoveredCell({
                                                        row: rowIndex,
                                                        col: colIndex,
                                                        value: value,
                                                    });
                                                    setAnchor(e.currentTarget);
                                                }}
                                                onMouseLeave={() => {
                                                    setHoveredCell(null);
                                                    setAnchor(null);
                                                }}
                                            >
                                                {value}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tooltip */}
            <InfoPop
                anchorEl={anchor}
                placement="top"
                open={!!anchor && !!hoveredCell}
            >
                <div>
                    {t('charts.actual')}: {stats.labels[hoveredCell?.row ?? 0]}
                </div>
                <div>
                    {t('charts.predicted')}: {stats.labels[hoveredCell?.col ?? 0]}
                </div>
                <div>
                    {t('charts.count')}: {hoveredCell?.value}
                </div>
            </InfoPop>
        </div>
    );
}
