import { type CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { Chart, TooltipModel } from 'chart.js/auto';
import { SankeyController, Flow } from 'chartjs-chart-sankey';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { useVariant } from '@genaitm/util/variant';
import { Help, PercentageBar } from '@genai-fi/base';
import { transferLearningExplanation } from '../../../state';
import { brightenColor, withAlpha } from '../../../util/colour';
import {
    buildTransferLearningGraphData,
    getTooltipCaretStyle,
    type TransferLearningGraphLink,
} from './TransferLearningGraphData';
import style from './TransferLearningGraph.module.css';
import chartStyle from '../Charts.module.css';

Chart.register(SankeyController, Flow);

const SANKEY_LABEL_COLOR = 'rgba(0, 0, 0, 1)';
const SANKEY_LABEL_FONT = {
    family: 'Andika, sans-serif',
    size: 14,
    weight: 600 as const,
};

const SANKEY_SOURCE_COLORS = [
    style.chartDark1,
    style.chartDark2,
    style.chartDark3,
    style.chartDark4,
    style.chartDark5,
    style.chartDark6,
    style.chartDark7,
    style.chartDark8,
];

interface GraphTooltipState {
    left: number;
    top: number;
    fromLabel: string;
    toLabel: string;
    flow: number;
    color: string;
    images: string[];
    caretStyle: CSSProperties;
}

export function TransferLearningGraph() {
    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);
    const explanation = useAtomValue(transferLearningExplanation);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [tooltipState, setTooltipState] = useState<GraphTooltipState | null>(null);

    const hideTooltip = useCallback(() => {
        setTooltipState(null);
    }, []);

    const chartData = useMemo(() => buildTransferLearningGraphData(explanation, t), [explanation, t]);

    useEffect(() => {
        if (!chartData) {
            hideTooltip();
            return;
        }

        const canvas = canvasRef.current;
        if (!canvas) return;

        let context: CanvasRenderingContext2D | null = null;
        try {
            context = canvas.getContext('2d');
        } catch {
            return;
        }
        if (!context) return;

        const fallbackColor = SANKEY_SOURCE_COLORS[0];
        const nodeBorderColor = style.borderGrey;
        const sourceColorByKey = Object.fromEntries(
            Object.entries(chartData.sourceIndexByKey).map(([key, index]) => [
                key,
                SANKEY_SOURCE_COLORS[index % SANKEY_SOURCE_COLORS.length],
            ])
        ) as Record<string, string>;

        const conceptImageUrlsRef = chartData.conceptImageUrls;
        const labelsRef = chartData.labels;

        const externalTooltip = (ctx: { chart: Chart; tooltip: TooltipModel<'sankey'> }) => {
            const { tooltip } = ctx;
            if (tooltip.opacity === 0) {
                setTooltipState(null);
                return;
            }
            const raw = tooltip.dataPoints?.[0]?.raw as TransferLearningGraphLink | undefined;
            if (!raw) {
                setTooltipState(null);
                return;
            }

            const fromLabel = labelsRef[raw.from] || raw.from;
            const toLabel = labelsRef[raw.to] || raw.to;
            const color = sourceColorByKey[raw.from] || fallbackColor;
            const images = raw.to?.startsWith('concept') ? (conceptImageUrlsRef[raw.to] ?? []).slice(0, 3) : [];

            const rect = ctx.chart.canvas.getBoundingClientRect();
            setTooltipState({
                left: rect.left + tooltip.x,
                top: rect.top + tooltip.y,
                fromLabel,
                toLabel,
                flow: raw.flow,
                color,
                images,
                caretStyle: getTooltipCaretStyle(tooltip),
            });
        };

        const sankeyDataset = {
            label: t('charts.transferLearningFlow'),
            data: chartData.links,
            parsing: {
                from: 'from',
                to: 'to',
                flow: 'flow',
            },
            labels: chartData.labels,
            column: chartData.columns,
            priority: chartData.priority,
            colorMode: 'from' as const,
            colorFrom: (ctx: { dataset: { data?: unknown[] }; dataIndex: number }) => {
                const point = (ctx.dataset.data?.[ctx.dataIndex] as { from?: string } | undefined)?.from;
                const base = point ? sourceColorByKey[point] || fallbackColor : fallbackColor;
                return withAlpha(base, 0.55);
            },
            colorTo: (ctx: { dataset: { data?: unknown[] }; dataIndex: number }) => {
                const point = (ctx.dataset.data?.[ctx.dataIndex] as { from?: string } | undefined)?.from;
                const base = point ? sourceColorByKey[point] || fallbackColor : fallbackColor;
                return withAlpha(base, 0.55);
            },
            hoverColorFrom: (ctx: { dataset: { data?: unknown[] }; dataIndex: number }) => {
                const point = (ctx.dataset.data?.[ctx.dataIndex] as { from?: string } | undefined)?.from;
                const base = point ? sourceColorByKey[point] || fallbackColor : fallbackColor;
                return brightenColor(base, 0.25);
            },
            hoverColorTo: (ctx: { dataset: { data?: unknown[] }; dataIndex: number }) => {
                const point = (ctx.dataset.data?.[ctx.dataIndex] as { from?: string } | undefined)?.from;
                const base = point ? sourceColorByKey[point] || fallbackColor : fallbackColor;
                return brightenColor(base, 0.25);
            },
            nodeWidth: 12,
            nodePadding: 24, // vertical space between nodes
            borderWidth: 1,
            borderColor: nodeBorderColor,
            color: SANKEY_LABEL_COLOR,
            font: SANKEY_LABEL_FONT,
            padding: 6,
        };

        const chart = new Chart(context, {
            type: 'sankey',
            plugins: [],
            data: {
                datasets: [sankeyDataset],
            },
            options: {
                animation: false,
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false,
                    },
                    tooltip: {
                        enabled: false,
                        external: externalTooltip,
                    },
                },
                scales: {
                    x: { display: false },
                    y: { display: false },
                },
            },
        });

        return () => {
            chart.destroy();
        };
    }, [chartData, hideTooltip, t]);

    useEffect(() => {
        return () => {
            hideTooltip();
        };
    }, [hideTooltip]);

    if (!chartData) {
        return null;
    }

    return (
        <section className={chartStyle.section}>
            <div className={chartStyle.titleRow}>
                <div className={chartStyle.title}>{t('charts.transferLearningGraph')}</div>
                <Help
                    inplace
                    message={t('charts.transferLearningGraphHelp')}
                    dark
                />
            </div>

            <div
                className={style.wrapper}
                data-chart-wrapper
                onMouseLeave={hideTooltip}
            >
                <div
                    className={style.chartFrame}
                    style={{ height: `${chartData.chartHeight}px` }}
                >
                    <canvas
                        ref={canvasRef}
                        className={style.chartCanvas}
                    />
                </div>
            </div>
            {tooltipState && (
                <div
                    className={style.tooltip}
                    style={{
                        left: tooltipState.left,
                        top: tooltipState.top,
                        opacity: 1,
                    }}
                >
                    <div className={style.tooltipFromRow}>
                        <span
                            className={style.tooltipSwatch}
                            style={{ background: tooltipState.color }}
                        />
                        <span>{tooltipState.fromLabel}</span>
                    </div>
                    <div className={style.tooltipArrow}>
                        <ArrowDownwardIcon style={{ fontSize: 22, color: 'black' }} />
                    </div>
                    <div className={style.tooltipToLabel}>{tooltipState.toLabel}</div>
                    <div className={style.tooltipFlow}>
                        <PercentageBar
                            colour="blue"
                            value={tooltipState.flow * 100}
                        />
                    </div>
                    {tooltipState.images.length > 0 && (
                        <div className={style.tooltipImages}>
                            {tooltipState.images.map((url) => (
                                <img
                                    key={url}
                                    src={url}
                                    className={style.tooltipImage}
                                    alt=""
                                />
                            ))}
                        </div>
                    )}
                    <span
                        className={style.tooltipCaret}
                        style={tooltipState.caretStyle}
                    />
                </div>
            )}
        </section>
    );
}
