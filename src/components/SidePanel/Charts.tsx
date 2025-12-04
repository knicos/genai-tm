import { useMemo, useState } from 'react';
import { useAtomValue } from 'jotai';
import { trainingHistory, modelStats } from '../../state';
import styles from './Charts.module.css';

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
    const [tooltip, setTooltip] = useState<{ x: number; y: number; epoch: number; acc: number; valAcc?: number } | null>(null);

    const { minY, maxY } = useMemo(() => {
        if (history.length === 0) return { minY: 0, maxY: 1 };
        const allValues = history.flatMap(h => [h.accuracy, h.valAccuracy].filter(v => v !== undefined) as number[]);
        return {
            minY: Math.min(...allValues) * 0.9,
            maxY: 1.0
        };
    }, [history]);

    if (history.length === 0) {
        return null;
    }

    const width = 500;
    const height = 200;
    const padding = { top: 20, right: 100, bottom: 40, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const maxEpoch = Math.max(...history.map(h => h.epoch));
    const xScale = (epoch: number) => (epoch / maxEpoch) * chartWidth;
    const yScale = (value: number) => chartHeight - ((value - minY) / (maxY - minY)) * chartHeight;

    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        const svg = e.currentTarget;
        const rect = svg.getBoundingClientRect();
        const mouseX = e.clientX - rect.left - padding.left;

        if (mouseX < 0 || mouseX > chartWidth) {
            setTooltip(null);
            return;
        }

        const epochRatio = mouseX / chartWidth;
        const targetEpoch = epochRatio * maxEpoch;
        const closestPoint = history.reduce((prev, curr) =>
            Math.abs(curr.epoch - targetEpoch) < Math.abs(prev.epoch - targetEpoch) ? curr : prev
        );

        if (closestPoint) {
            setTooltip({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top - 10,
                epoch: closestPoint.epoch,
                acc: closestPoint.accuracy,
                valAcc: closestPoint.valAccuracy
            });
        }
    };

    return (
        <div className={styles.chartContainer}>
            <h3 className={styles.chartTitle}>
                Accuracy per epoch
            </h3>
            <div className={styles.chartScrollWrapper}>
                <svg
                    width={width}
                    height={height}
                    className={styles.chartSvg}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => setTooltip(null)}
                >
                    {/* Grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
                        const y = padding.top + yScale(minY + (maxY - minY) * tick);
                        return (
                            <g key={tick}>
                                <line
                                    x1={padding.left}
                                    y1={y}
                                    x2={padding.left + chartWidth}
                                    y2={y}
                                    stroke="#f0f0f0"
                                    strokeWidth="1"
                                />
                                <text
                                    x={padding.left - 10}
                                    y={y + 4}
                                    textAnchor="end"
                                    fontSize="10"
                                    fill="#666"
                                >
                                    {(minY + (maxY - minY) * tick).toFixed(2)}
                                </text>
                            </g>
                        );
                    })}

                    {/* X-axis labels */}
                    {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
                        const x = padding.left + xScale(maxEpoch * tick);
                        return (
                            <text
                                key={tick}
                                x={x}
                                y={height - padding.bottom + 20}
                                textAnchor="middle"
                                fontSize="10"
                                fill="#666"
                            >
                                {Math.round(maxEpoch * tick)}
                            </text>
                        );
                    })}

                    {/* X-axis label */}
                    <text
                        x={padding.left + chartWidth / 2}
                        y={height - 5}
                        textAnchor="middle"
                        fontSize="12"
                        fill="#333"
                    >
                        Epochs
                    </text>

                    {/* Y-axis label */}
                    <text
                        x={-padding.top - chartHeight / 2}
                        y={15}
                        textAnchor="middle"
                        fontSize="12"
                        fill="#333"
                        transform={`rotate(-90)`}
                    >
                        Accuracy
                    </text>

                    {/* Training accuracy line */}
                    <polyline
                        fill="none"
                        stroke="#1976d2"
                        strokeWidth="2"
                        points={history
                            .map((h) => `${padding.left + xScale(h.epoch)},${padding.top + yScale(h.accuracy)}`)
                            .join(' ')}
                    />

                    {/* Validation accuracy line */}
                    {history.some(h => h.valAccuracy !== undefined) && (
                        <polyline
                            fill="none"
                            stroke="#ff9800"
                            strokeWidth="2"
                            strokeDasharray="4,4"
                            points={history
                                .filter(h => h.valAccuracy !== undefined)
                                .map((h) => `${padding.left + xScale(h.epoch)},${padding.top + yScale(h.valAccuracy!)}`)
                                .join(' ')}
                        />
                    )}

                    {/* Legend */}
                    <g transform={`translate(${padding.left + chartWidth + 10}, ${padding.top})`}>
                        <line x1="0" y1="0" x2="20" y2="0" stroke="#1976d2" strokeWidth="2" />
                        <text x="25" y="4" fontSize="10" fill="#333">acc</text>
                        {history.some(h => h.valAccuracy !== undefined) && (
                            <>
                                <line x1="0" y1="15" x2="20" y2="15" stroke="#ff9800" strokeWidth="2" strokeDasharray="4,4" />
                                <text x="25" y="19" fontSize="10" fill="#333">val acc</text>
                            </>
                        )}
                    </g>
                </svg>
            </div>

            {/* Tooltip */}
            {tooltip && (
                <div
                    className={styles.chartTooltip}
                    style={{
                        left: tooltip.x,
                        top: tooltip.y
                    }}
                >
                    <div>x: {tooltip.epoch}</div>
                    <div className={styles.tooltipValue}>acc: {tooltip.acc.toFixed(3)}</div>
                    {tooltip.valAcc !== undefined && (
                        <div className={styles.tooltipValueAlt}>test acc: {tooltip.valAcc.toFixed(3)}</div>
                    )}
                </div>
            )}
        </div>
    );
}

export function LossPerEpoch() {
    const history = useAtomValue(trainingHistory);
    const [tooltip, setTooltip] = useState<{ x: number; y: number; epoch: number; loss: number; valLoss?: number } | null>(null);

    const { minY, maxY } = useMemo(() => {
        if (history.length === 0) return { minY: 0, maxY: 1 };
        const allValues = history.flatMap(h => [h.loss, h.valLoss].filter(v => v !== undefined) as number[]);
        return {
            minY: 0,
            maxY: Math.max(...allValues) * 1.1
        };
    }, [history]);

    if (history.length === 0) {
        return null;
    }

    const width = 500;
    const height = 200;
    const padding = { top: 20, right: 100, bottom: 40, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    const maxEpoch = Math.max(...history.map(h => h.epoch));
    const xScale = (epoch: number) => (epoch / maxEpoch) * chartWidth;
    const yScale = (value: number) => chartHeight - ((value - minY) / (maxY - minY)) * chartHeight;

    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        const svg = e.currentTarget;
        const rect = svg.getBoundingClientRect();
        const mouseX = e.clientX - rect.left - padding.left;

        if (mouseX < 0 || mouseX > chartWidth) {
            setTooltip(null);
            return;
        }

        const epochRatio = mouseX / chartWidth;
        const targetEpoch = epochRatio * maxEpoch;
        const closestPoint = history.reduce((prev, curr) =>
            Math.abs(curr.epoch - targetEpoch) < Math.abs(prev.epoch - targetEpoch) ? curr : prev
        );

        if (closestPoint) {
            setTooltip({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top - 10,
                epoch: closestPoint.epoch,
                loss: closestPoint.loss,
                valLoss: closestPoint.valLoss
            });
        }
    };

    return (
        <div className={styles.chartContainer}>
            <h3 className={styles.chartTitle}>
                Loss per epoch
            </h3>
            <div className={styles.chartScrollWrapper}>
                <svg
                    width={width}
                    height={height}
                    className={styles.chartSvg}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => setTooltip(null)}
                >
                    {/* Grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
                        const y = padding.top + yScale(minY + (maxY - minY) * tick);
                        return (
                            <g key={tick}>
                                <line
                                    x1={padding.left}
                                    y1={y}
                                    x2={padding.left + chartWidth}
                                    y2={y}
                                    stroke="#f0f0f0"
                                    strokeWidth="1"
                                />
                                <text
                                    x={padding.left - 10}
                                    y={y + 4}
                                    textAnchor="end"
                                    fontSize="10"
                                    fill="#666"
                                >
                                    {(minY + (maxY - minY) * tick).toFixed(2)}
                                </text>
                            </g>
                        );
                    })}

                    {/* X-axis labels */}
                    {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
                        const x = padding.left + xScale(maxEpoch * tick);
                        return (
                            <text
                                key={tick}
                                x={x}
                                y={height - padding.bottom + 20}
                                textAnchor="middle"
                                fontSize="10"
                                fill="#666"
                            >
                                {Math.round(maxEpoch * tick)}
                            </text>
                        );
                    })}

                    {/* X-axis label */}
                    <text
                        x={padding.left + chartWidth / 2}
                        y={height - 5}
                        textAnchor="middle"
                        fontSize="12"
                        fill="#333"
                    >
                        Epochs
                    </text>

                    {/* Y-axis label */}
                    <text
                        x={-padding.top - chartHeight / 2}
                        y={15}
                        textAnchor="middle"
                        fontSize="12"
                        fill="#333"
                        transform={`rotate(-90)`}
                    >
                        Loss
                    </text>

                    {/* Training loss line */}
                    <polyline
                        fill="none"
                        stroke="#1976d2"
                        strokeWidth="2"
                        points={history
                            .map((h) => `${padding.left + xScale(h.epoch)},${padding.top + yScale(h.loss)}`)
                            .join(' ')}
                    />

                    {/* Validation loss line */}
                    {history.some(h => h.valLoss !== undefined) && (
                        <polyline
                            fill="none"
                            stroke="#ff9800"
                            strokeWidth="2"
                            strokeDasharray="4,4"
                            points={history
                                .filter(h => h.valLoss !== undefined)
                                .map((h) => `${padding.left + xScale(h.epoch)},${padding.top + yScale(h.valLoss!)}`)
                                .join(' ')}
                        />
                    )}

                    {/* Legend */}
                    <g transform={`translate(${padding.left + chartWidth + 10}, ${padding.top})`}>
                        <line x1="0" y1="0" x2="20" y2="0" stroke="#1976d2" strokeWidth="2" />
                        <text x="25" y="4" fontSize="10" fill="#333">loss</text>
                        {history.some(h => h.valLoss !== undefined) && (
                            <>
                                <line x1="0" y1="15" x2="20" y2="15" stroke="#ff9800" strokeWidth="2" strokeDasharray="4,4" />
                                <text x="25" y="19" fontSize="10" fill="#333">val loss</text>
                            </>
                        )}
                    </g>
                </svg>
            </div>

            {/* Tooltip */}
            {tooltip && (
                <div
                    className={styles.chartTooltip}
                    style={{
                        left: tooltip.x,
                        top: tooltip.y
                    }}
                >
                    <div>x: {tooltip.epoch}</div>
                    <div className={styles.tooltipValue}>loss: {tooltip.loss.toFixed(3)}</div>
                    {tooltip.valLoss !== undefined && (
                        <div className={styles.tooltipValueAlt}>test loss: {tooltip.valLoss.toFixed(3)}</div>
                    )}
                </div>
            )}
        </div>
    );
}