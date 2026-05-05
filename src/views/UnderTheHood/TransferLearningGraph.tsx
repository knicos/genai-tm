import { useEffect, useMemo, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import { SankeyController, Flow } from 'chartjs-chart-sankey';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { useVariant } from '@genaitm/util/variant';
import { Help } from '@genai-fi/base';
import { transferLearningExplanation } from '../../state';
import style from './TransferLearningGraph.module.css';
import underTheHoodStyle from './UnderTheHood.module.css';

Chart.register(SankeyController, Flow);

const SANKEY_LABEL_COLOR = 'rgba(255, 255, 255, 0.95)';
const SANKEY_LABEL_FONT = {
    family: 'Andika, sans-serif',
    size: 14,
    weight: 600 as const,
};

const SANKEY_SOURCE_COLORS = [
    style.bgSubdued1,
    style.bgColourful2,
    style.bgOk,
    style.secondaryLight,
    style.primaryLight,
    style.bgSubdued3,
];

function hexToRgb(hex: string) {
    const normalized = hex.replace('#', '');
    const full =
        normalized.length === 3
            ? normalized
                  .split('')
                  .map((v) => `${v}${v}`)
                  .join('')
            : normalized;
    const value = Number.parseInt(full, 16);
    return {
        r: (value >> 16) & 255,
        g: (value >> 8) & 255,
        b: value & 255,
    };
}

function withAlpha(hex: string, alpha: number) {
    const { r, g, b } = hexToRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function brighten(hex: string, amount = 0.2) {
    const { r, g, b } = hexToRgb(hex);
    const mix = (channel: number) => Math.round(channel + (255 - channel) * amount);
    return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

export function TransferLearningGraph() {
    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);
    const explanation = useAtomValue(transferLearningExplanation);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    const chartData = useMemo(() => {
        if (!explanation || explanation.userClassProfiles.length === 0) return null;

        const conceptMeta = new Map<number, { className: string; maxWeight: number }>();

        const upsertConceptMeta = (classId: number, className: string, probability: number) => {
            const current = conceptMeta.get(classId);
            conceptMeta.set(classId, {
                className,
                maxWeight: Math.max(current?.maxWeight || 0, probability),
            });
        };

        explanation.userClassProfiles.forEach((profile) => {
            profile.topConcepts.forEach((concept) => {
                upsertConceptMeta(concept.classId, concept.className, concept.probability);
            });
        });

        explanation.currentImageTopConcepts.forEach((concept) => {
            upsertConceptMeta(concept.classId, concept.className, concept.probability);
        });

        const rightNodesBase = [...conceptMeta.entries()].sort((a, b) => b[1].maxWeight - a[1].maxWeight);

        const rightNodeByConcept = new Map<number, string>();
        rightNodesBase.forEach(([classId]) => {
            rightNodeByConcept.set(classId, `concept${classId}`);
        });

        const leftNodesBase = [
            {
                key: 'currentInput',
                label: t('charts.transferLearningCurrentInput'),
                secondary: '',
            },
            ...explanation.userClassProfiles.map((profile) => ({
                key: `class${profile.userClassIndex}`,
                label: profile.userClassLabel,
                secondary: t('charts.transferLearningSamples', { count: profile.sampleCount }),
            })),
        ];

        const links: { from: string; to: string; flow: number }[] = [];

        explanation.currentImageTopConcepts.forEach((concept) => {
            const toKey = rightNodeByConcept.get(concept.classId);
            if (!toKey) return;
            links.push({
                from: 'currentInput',
                to: toKey,
                flow: concept.probability,
            });
        });

        explanation.userClassProfiles.forEach((profile) => {
            const fromKey = `class${profile.userClassIndex}`;
            profile.topConcepts.forEach((concept) => {
                const toKey = rightNodeByConcept.get(concept.classId);
                if (!toKey) return;
                links.push({
                    from: fromKey,
                    to: toKey,
                    flow: concept.probability,
                });
            });
        });

        const dominantIncomingByTarget = new Map<string, { from: string; flow: number }>();
        links.forEach((link) => {
            const current = dominantIncomingByTarget.get(link.to);
            const shouldReplace =
                !current ||
                link.flow > current.flow ||
                (link.flow === current.flow && link.from === 'currentInput' && current.from !== 'currentInput');

            if (shouldReplace) {
                dominantIncomingByTarget.set(link.to, {
                    from: link.from,
                    flow: link.flow,
                });
            }
        });

        const orderedLinks = [...links].sort((a, b) => {
            if (a.to !== b.to) {
                return a.to.localeCompare(b.to);
            }

            const dominant = dominantIncomingByTarget.get(a.to);
            const aIsDominant = dominant?.from === a.from;
            const bIsDominant = dominant?.from === b.from;

            if (aIsDominant !== bIsDominant) {
                return aIsDominant ? 1 : -1;
            }

            return a.flow - b.flow;
        });

        const labels: Record<string, string> = {
            currentInput: t('charts.transferLearningCurrentInput'),
        };
        const columns: Record<string, number> = {};
        const priority: Record<string, number> = {};
        const sourceIndexByKey: Record<string, number> = {};

        leftNodesBase.forEach((node, index) => {
            labels[node.key] = node.secondary ? `${node.label} (${node.secondary})` : node.label;
            columns[node.key] = 0;
            priority[node.key] = index;
            sourceIndexByKey[node.key] = index;
        });

        rightNodesBase.forEach(([classId, meta], index) => {
            const key = `concept${classId}`;
            labels[key] = meta.className;
            columns[key] = 1;
            priority[key] = index;
        });

        const maxNodesPerColumn = Math.max(leftNodesBase.length, rightNodesBase.length);
        const chartHeight = Math.max(320, 120 + maxNodesPerColumn * 56);

        return {
            links: orderedLinks,
            labels,
            columns,
            priority,
            sourceIndexByKey,
            chartHeight,
        };
    }, [explanation, t]);

    useEffect(() => {
        if (!chartData) return;

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

        const chart = new Chart(context, {
            type: 'sankey',
            data: {
                datasets: [
                    {
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
                        colorMode: 'from',
                        colorFrom: (ctx) => {
                            const point = (ctx.dataset.data?.[ctx.dataIndex] as { from?: string } | undefined)?.from;
                            const base = point ? sourceColorByKey[point] || fallbackColor : fallbackColor;
                            return withAlpha(base, 0.55);
                        },
                        colorTo: (ctx) => {
                            const point = (ctx.dataset.data?.[ctx.dataIndex] as { from?: string } | undefined)?.from;
                            const base = point ? sourceColorByKey[point] || fallbackColor : fallbackColor;
                            return withAlpha(base, 0.55);
                        },
                        hoverColorFrom: (ctx) => {
                            const point = (ctx.dataset.data?.[ctx.dataIndex] as { from?: string } | undefined)?.from;
                            const base = point ? sourceColorByKey[point] || fallbackColor : fallbackColor;
                            return brighten(base, 0.25);
                        },
                        hoverColorTo: (ctx) => {
                            const point = (ctx.dataset.data?.[ctx.dataIndex] as { from?: string } | undefined)?.from;
                            const base = point ? sourceColorByKey[point] || fallbackColor : fallbackColor;
                            return brighten(base, 0.25);
                        },
                        nodeWidth: 12,
                        nodePadding: 24, // vertical space between nodes
                        borderWidth: 1,
                        borderColor: nodeBorderColor,
                        color: SANKEY_LABEL_COLOR,
                        font: SANKEY_LABEL_FONT,
                        padding: 6,
                    },
                ],
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
                        titleColor: SANKEY_LABEL_COLOR,
                        bodyColor: SANKEY_LABEL_COLOR,
                        footerColor: SANKEY_LABEL_COLOR,
                        titleFont: SANKEY_LABEL_FONT,
                        bodyFont: SANKEY_LABEL_FONT,
                        footerFont: SANKEY_LABEL_FONT,
                        callbacks: {
                            label: (tooltipItem) => {
                                const raw = tooltipItem.raw as { from: string; to: string; flow: number };
                                const fromLabel = chartData.labels[raw.from] || raw.from;
                                const toLabel = chartData.labels[raw.to] || raw.to;
                                const flowPct = raw.flow * 100;
                                const flowStr = flowPct === 0 ? '0%' : flowPct < 1 ? '< 1%' : `${flowPct.toFixed(0)}%`;
                                return `${fromLabel} → ${toLabel}: ${flowStr}`;
                            },
                            labelColor: (tooltipItem) => {
                                const raw = tooltipItem.raw as { from: string };
                                const color = sourceColorByKey[raw.from] || fallbackColor;
                                return {
                                    borderColor: color,
                                    backgroundColor: color,
                                };
                            },
                        },
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
    }, [chartData, t]);

    if (!chartData) {
        return null;
    }

    return (
        <section className={style.section}>
            <div className={style.titleRow}>
                <div className={`${underTheHoodStyle.heatmapLabel} ${style.title}`}>
                    {t('charts.transferLearningGraph')}
                </div>
                <Help
                    inplace
                    placement="right"
                    message={t('charts.transferLearningGraphHelp')}
                    dark
                />
            </div>

            <div className={style.wrapper}>
                <div className={style.chartFrame}>
                    <canvas
                        ref={canvasRef}
                        className={style.chartCanvas}
                        style={{ height: `${chartData.chartHeight}px` }}
                    />
                </div>
            </div>
        </section>
    );
}
