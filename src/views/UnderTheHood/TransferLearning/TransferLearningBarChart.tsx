import { useEffect, useMemo, useRef } from 'react';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { Help } from '@genai-fi/base';
import { useVariant } from '@genaitm/util/variant';
import { Chart } from 'chart.js/auto';
import { transferLearningExplanation } from '../../../state';
import { softenColor } from '../../../util/colour';
import style from './TransferLearningBarChart.module.css';
import chartStyle from '../Charts.module.css';
import graphStyle from './TransferLearningGraph.module.css';

const SOURCE_COLORS = [
    graphStyle.chartDark1,
    graphStyle.chartDark2,
    graphStyle.chartDark3,
    graphStyle.chartDark4,
    graphStyle.chartDark5,
    graphStyle.chartDark6,
    graphStyle.chartDark7,
    graphStyle.chartDark8,
];

interface SimilarityRow {
    userClassIndex: number;
    userClassLabel: string;
    color: string;
    percent: number;
    displayPercent: string;
    sampleCount: number;
}

function toPercent(value: number) {
    const pct = Math.max(0, Math.min(1, value)) * 100;
    return pct === 0 ? '0%' : pct < 1 ? '< 1%' : `${pct.toFixed(0)}%`;
}

function getChartData(rows: SimilarityRow[]) {
    const labels: string[] = [];
    const data: number[] = [];
    const colors: string[] = [];

    rows.forEach((row) => {
        labels.push(row.userClassLabel);
        data.push(row.percent);
        colors.push(row.color);
    });

    return { labels, data, colors };
}

export function TransferLearningBarChart() {
    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);
    const explanation = useAtomValue(transferLearningExplanation);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const chartRef = useRef<Chart<'bar'> | null>(null);
    const rowsRef = useRef<SimilarityRow[]>([]);
    const tRef = useRef(t);

    const rows = useMemo<SimilarityRow[]>(() => {
        if (!explanation) return [];

        const similarityMap = new Map(explanation.userClassSimilarity.map((item) => [item.userClassIndex, item.score]));

        return explanation.userClassProfiles.map((profile, index) => {
            const score = Math.max(0, Math.min(1, similarityMap.get(profile.userClassIndex) || 0));
            return {
                userClassIndex: profile.userClassIndex,
                userClassLabel: profile.userClassLabel,
                color: softenColor(SOURCE_COLORS[(index + 1) % SOURCE_COLORS.length]),
                percent: score * 100,
                displayPercent: toPercent(score),
                sampleCount: profile.sampleCount,
            };
        });
    }, [explanation]);

    rowsRef.current = rows;
    tRef.current = t;

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || rows.length === 0) {
            chartRef.current?.destroy();
            chartRef.current = null;
            return;
        }

        const valueLabelPlugin = {
            id: 'similarityValueLabels',
            afterDatasetsDraw(chart: Chart<'bar'>) {
                const { ctx } = chart;
                const meta = chart.getDatasetMeta(0);

                ctx.save();
                ctx.fillStyle = 'white';
                ctx.font = '700 14px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';

                meta.data.forEach((bar, index) => {
                    const label = rowsRef.current[index]?.displayPercent;
                    if (!label) return;

                    const { x, y } = bar.tooltipPosition(true);
                    if (x === null || y === null) return;
                    ctx.fillText(label, x, y - 8);
                });

                ctx.restore();
            },
        };

        const chartData = getChartData(rows);

        if (chartRef.current) {
            const chart = chartRef.current;
            chart.data.labels = chartData.labels;
            chart.data.datasets[0].data = chartData.data;
            chart.data.datasets[0].backgroundColor = chartData.colors;
            chart.data.datasets[0].label = t('charts.transferLearningSimilarity');
            chart.update();
            return;
        }

        chartRef.current = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: chartData.labels,
                datasets: [
                    {
                        label: t('charts.transferLearningSimilarity'),
                        data: chartData.data,
                        backgroundColor: chartData.colors,
                        borderRadius: 0,
                        borderSkipped: false,
                        maxBarThickness: 52,
                    },
                ],
            },
            plugins: [valueLabelPlugin],
            options: {
                animation: { duration: 500 },
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: { top: 24, right: 8, bottom: 0, left: 0 },
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: 'white',
                        titleColor: graphStyle.textDark,
                        bodyColor: graphStyle.textDark,
                        borderColor: graphStyle.borderGrey,
                        borderWidth: 1,
                        titleFont: { size: 14, weight: 'bold' },
                        bodyFont: { size: 13, family: 'monospace' },
                        padding: 10,
                        boxPadding: 6,
                        callbacks: {
                            label: (item) => {
                                const label = tRef.current('charts.transferLearningSimilarity');
                                const value = rowsRef.current[item.dataIndex]?.displayPercent;
                                return `${label.padEnd(16)}${value}`;
                            },
                        },
                    },
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: {
                            color: 'white',
                            font: { size: 13, weight: 'bold' },
                            maxRotation: 0,
                            autoSkip: false,
                        },
                    },
                    y: {
                        beginAtZero: true,
                        min: 0,
                        max: 100,
                        grid: { color: 'rgba(255,255,255,0.12)' },
                        ticks: {
                            color: 'white',
                            font: { size: 13 },
                            stepSize: 25,
                            callback: (value) => `${value}%`,
                        },
                    },
                },
            },
        });
    }, [rows, t]);

    useEffect(() => {
        return () => {
            chartRef.current?.destroy();
            chartRef.current = null;
        };
    }, []);

    if (!explanation || rows.length === 0) {
        return null;
    }

    return (
        <section className={chartStyle.section}>
            <div className={chartStyle.titleRow}>
                <div className={chartStyle.title}>{t('charts.transferLearningBarChart')}</div>
                <Help
                    inplace
                    message={t('charts.transferLearningBarChartHelp')}
                    dark
                />
            </div>

            <div className={chartStyle.chartScrollWrapper}>
                <div
                    className={style.chartFrame}
                    style={{ minWidth: `${Math.max(320, rows.length * 120)}px` }}
                >
                    <canvas
                        ref={canvasRef}
                        aria-label={t('charts.transferLearningBarChart')}
                    />
                </div>
            </div>
        </section>
    );
}
