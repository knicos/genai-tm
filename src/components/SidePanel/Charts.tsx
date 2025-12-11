import { useMemo, useState } from 'react';
import { useAtomValue } from 'jotai';
import { trainingHistory, modelStats } from '../../state';
import styles from './Charts.module.css';
import { LineChart } from '@mui/x-charts/LineChart';

export function AccuracyPerClass() {
    const stats = useAtomValue(modelStats);

    if (!stats.accuracyPerClass || stats.accuracyPerClass.length === 0) {
        return null;
    }

    return (
        <div className={styles.chartContainer}>
            <h3 className={styles.chartTitle}>
                Accuracy per class
            </h3>
            <table className={styles.table}>
                <thead>
                    <tr className={styles.tableHeader}>
                        <th className={styles.tableHeaderCell}>CLASS</th>
                        <th className={styles.tableHeaderCell}>ACCURACY</th>
                        <th className={styles.tableHeaderCell}># SAMPLES</th>
                    </tr>
                </thead>
                <tbody>
                    {stats.accuracyPerClass.map((item, index) => (
                        <tr key={index} className={styles.tableRow}>
                            <td className={styles.tableCell}>{stats.labels[index]}</td>
                            <td className={styles.tableCell}>{item.accuracy.toFixed(2)}</td>
                            <td className={styles.tableCell}>{item.samples}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export function ConfusionMatrix() {
    const stats = useAtomValue(modelStats);
    const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number; x: number; y: number; value: number } | null>(null);

    const maxValue = useMemo(() => {
        if (!stats.confusionMatrix) return 1;
        return Math.max(...stats.confusionMatrix.flat());
    }, [stats.confusionMatrix]);

    if (!stats.confusionMatrix || stats.confusionMatrix.length === 0) {
        return null;
    }

    return (
        <div className={styles.chartContainer}>
            <h3 className={styles.chartTitle}>
                Confusion Matrix
            </h3>
            <div className={styles.matrixScrollWrapper}>
                <div className={styles.matrixContainer}>
                    <div className={styles.matrixHeaderRow}>
                        <div className={styles.matrixHeaderSpacer}></div>
                        <div className={styles.matrixHeaderTitle}>
                            Prediction
                        </div>
                    </div>
                    <div className={styles.matrixContent}>
                        <div className={styles.matrixYAxisLabel}>
                            Class
                        </div>
                        <div className={styles.matrixBody}>
                            <div className={styles.matrixColumnHeaders}>
                                <div className={styles.matrixHeaderSpacer}></div>
                                {stats.labels.map((label, index) => (
                                    <div key={index} className={styles.matrixColumnHeader}>
                                        {label}
                                    </div>
                                ))}
                            </div>
                            {stats.confusionMatrix.map((row, rowIndex) => (
                                <div key={rowIndex} style={{ display: 'flex', marginBottom: '2px' }}>
                                    <div style={{
                                        width: '80px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        fontSize: '0.75rem',
                                        paddingRight: '0.5rem'
                                    }}>
                                        {stats.labels[rowIndex]}
                                    </div>
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
                                                    fontWeight: value > 0 ? 'bold' : 'normal'
                                                }}
                                                onMouseEnter={(e) => {
                                                    const rect = e.currentTarget.getBoundingClientRect();
                                                    setHoveredCell({
                                                        row: rowIndex,
                                                        col: colIndex,
                                                        x: rect.left + rect.width / 2,
                                                        y: rect.top,
                                                        value: value
                                                    });
                                                }}
                                                onMouseLeave={() => setHoveredCell(null)}
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
            {hoveredCell && (
                <div
                    className={styles.tooltip}
                    style={{
                        left: hoveredCell.x,
                        top: hoveredCell.y - 10
                    }}
                >
                    <div>Actual: {stats.labels[hoveredCell.row]}</div>
                    <div>Predicted: {stats.labels[hoveredCell.col]}</div>
                    <div>Count: {hoveredCell.value}</div>
                </div>
            )}
        </div>
    );
}

export function AccuracyPerEpoch() {
    const history = useAtomValue(trainingHistory);

    const dataset = useMemo(() => history.map(h => ({
        epoch: h.epoch,
        accuracy: h.accuracy,
        valAccuracy: h.valAccuracy ?? 0
    })), [history]);

    const series = useMemo(() => {
        const result = [
            {
                dataKey: 'accuracy',
                label: 'acc',
                color: 'rgb(25, 118, 210)',
                showMark: false
            }
        ];

        if (history.some(h => h.valAccuracy !== undefined)) {
            result.push({
                dataKey: 'valAccuracy',
                label: 'test acc',
                color: 'rgb(255, 152, 0)',
                showMark: false
            });
        }

        return result;
    }, [history]);

    const maxEpoch = useMemo(() => Math.max(...history.map(h => h.epoch), 0), [history]);

    if (history.length === 0) {
        return null;
    }

    return (
        <div className={styles.chartContainer}>
            <h3 className={styles.chartTitle}>
                Accuracy per epoch
            </h3>
            <div className={styles.chartScrollWrapper}>
                <div style={{ minWidth: Math.max(300, maxEpoch * 6) + 'px' }}>
                    <LineChart
                        dataset={dataset}
                        xAxis={[{
                            data: history.map(h => h.epoch),
                            label: 'Epochs',
                            scaleType: 'linear',
                            min: 0,
                            max: maxEpoch,
                            tickNumber: 10,
                            valueFormatter: (value) => `Epoch ${Math.round(value)}`
                        }]}
                        yAxis={[{
                            label: 'Accuracy',
                            min: 0,
                            max: 1
                        }]}
                        series={series}
                        height={250}
                        // margin={{ top: 10, right: 80, bottom: 50, left: 50 }}
                        slotProps={{
                            legend: {
                                position: { vertical: 'middle', horizontal: 'center' }
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

export function LossPerEpoch() {
    const history = useAtomValue(trainingHistory);

    const dataset = useMemo(() => history.map(h => ({
        epoch: h.epoch,
        loss: h.loss,
        valLoss: h.valLoss ?? 0
    })), [history]);

    const series = useMemo(() => {
        const result = [
            {
                dataKey: 'loss',
                label: 'loss',
                color: 'rgb(25, 118, 210)',
                showMark: false
            }
        ];

        if (history.some(h => h.valLoss !== undefined)) {
            result.push({
                dataKey: 'valLoss',
                label: 'test loss',
                color: 'rgb(255, 152, 0)',
                showMark: false
            });
        }

        return result;
    }, [history]);

    const maxEpoch = useMemo(() => Math.max(...history.map(h => h.epoch), 0), [history]);

    if (history.length === 0) {
        return null;
    }

    return (
        <div className={styles.chartContainer}>
            <h3 className={styles.chartTitle}>
                Loss per epoch
            </h3>
            <div className={styles.chartScrollWrapper}>
                <div style={{ minWidth: Math.max(300, maxEpoch * 6) + 'px' }}>
                    <LineChart
                        dataset={dataset}
                        xAxis={[{
                            data: history.map(h => h.epoch),
                            label: 'Epochs',
                            scaleType: 'linear',
                            min: 0,
                            max: maxEpoch,
                            tickNumber: 10,
                            valueFormatter: (value) => `Epoch ${Math.round(value)}`
                        }]}
                        yAxis={[{
                            label: 'Loss',
                            min: 0
                        }]}
                        series={series}
                        height={250}
                        // margin={{ top: 10, right: 80, bottom: 50, left: 50 }}
                        slotProps={{
                            legend: {
                                position: { vertical: 'middle', horizontal: 'center' }
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
}