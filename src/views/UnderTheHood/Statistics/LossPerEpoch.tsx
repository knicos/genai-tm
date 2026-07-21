import { useEffect, useMemo, useRef } from 'react';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { Chart } from 'chart.js/auto';
import { trainingHistory } from '../../../state';
import styles from '../Charts.module.css';
import { useVariant } from '@genaitm/util/variant';
import { Help } from '@genai-fi/base';

const crosshairPlugin = {
    id: 'crosshair',
    afterDraw(chart: Chart) {
        const active = chart.tooltip?.getActiveElements();
        if (!active || active.length === 0) return;
        const ctx = chart.ctx;
        const x = active[0].element.x;
        const { top, bottom } = chart.scales.y;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(x, top);
        ctx.lineTo(x, bottom);
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(200,200,200,0.5)';
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.restore();
    },
};

export function LossPerEpoch() {
    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);
    const history = useAtomValue(trainingHistory);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const hasValLoss = useMemo(() => history.some((h) => h.valLoss !== undefined), [history]);
    const maxEpoch = useMemo(() => Math.max(...history.map((h) => h.epoch), 0), [history]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || history.length === 0) return;

        const epochs = history.map((h) => h.epoch);
        const datasets = [
            {
                label: t('charts.loss').toLocaleLowerCase(),
                data: history.map((h) => h.loss),
                borderColor: '#5eb3f6',
                backgroundColor: '#5eb3f6',
                pointRadius: 0,
                tension: 0.3,
            },
        ];

        if (hasValLoss) {
            datasets.push({
                label: t('charts.testLoss'),
                data: history.map((h) => h.valLoss ?? 0),
                borderColor: 'rgb(255, 152, 0)',
                backgroundColor: 'rgb(255, 152, 0)',
                pointRadius: 0,
                tension: 0.3,
            });
        }

        const chart = new Chart(canvas, {
            type: 'line',
            data: { labels: epochs, datasets },
            plugins: [crosshairPlugin],
            options: {
                animation: false,
                responsive: true,
                maintainAspectRatio: false,
                interaction: { mode: 'index', intersect: false },
                plugins: {
                    legend: { labels: { color: 'white', font: { size: 13 } } },
                    tooltip: {
                        backgroundColor: 'white',
                        titleColor: styles.textDark,
                        bodyColor: styles.textDark,
                        borderColor: styles.borderGrey,
                        borderWidth: 1,
                        titleFont: { size: 14, weight: 'bold' },
                        bodyFont: { size: 13, family: 'monospace' },
                        padding: 10,
                        boxPadding: 6,
                        callbacks: {
                            title: (items) => `${t('charts.epoch')} ${items[0].label}`,
                            label: (item) => {
                                const label = item.dataset.label ?? '';
                                const value =
                                    typeof item.parsed.y === 'number'
                                        ? item.parsed.y.toFixed(item.parsed.y % 1 === 0 ? 0 : 3)
                                        : item.parsed.y;
                                return `${label.padEnd(16)}${value}`;
                            },
                        },
                    },
                },
                scales: {
                    x: {
                        ticks: {
                            color: 'white',
                            font: { size: 13 },
                            maxTicksLimit: 10,
                            callback: (_, index) => `${epochs[index] ?? index}`,
                        },
                        grid: { color: 'rgba(128,128,128,0.2)' },
                        title: {
                            display: true,
                            text: t('charts.epochs'),
                            color: 'white',
                            font: { size: 14, weight: 'bold' },
                        },
                        min: 0,
                        max: maxEpoch,
                    },
                    y: {
                        ticks: { color: 'white', font: { size: 13 } },
                        grid: { color: 'rgba(128,128,128,0.2)' },
                        title: {
                            display: true,
                            text: t('charts.loss'),
                            color: 'white',
                            font: { size: 14, weight: 'bold' },
                        },
                        min: 0,
                    },
                },
            },
        });

        return () => chart.destroy();
    }, [history, hasValLoss, maxEpoch, t]);

    if (history.length === 0) {
        return null;
    }

    return (
        <div className={styles.chartContainer}>
            <div className={styles.chartTitleRow}>
                <h3 className={styles.chartTitle}>{t('charts.lossPerEpoch')}</h3>
                <Help
                    inplace
                    message={t('charts.lossPerEpochHelp')}
                    dark
                />
            </div>
            <div className={styles.chartScrollWrapper}>
                <div style={{ minWidth: Math.max(300, maxEpoch * 6) + 'px', height: '250px' }}>
                    <canvas ref={canvasRef} />
                </div>
            </div>
        </div>
    );
}
