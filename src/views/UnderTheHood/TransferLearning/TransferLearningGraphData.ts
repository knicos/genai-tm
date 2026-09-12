import { type CSSProperties } from 'react';
import { type TFunction } from 'i18next';
import { type ITransferLearningExplanation } from '../../../state';

export interface TransferLearningGraphLink {
    from: string;
    to: string;
    flow: number;
}

export interface TransferLearningGraphData {
    links: TransferLearningGraphLink[];
    labels: Record<string, string>;
    columns: Record<string, number>;
    priority: Record<string, number>;
    sourceIndexByKey: Record<string, number>;
    conceptImageUrls: Record<string, string[]>;
    chartHeight: number;
}

interface ConceptMeta {
    className: string;
    maxWeight: number;
    imageUrls: string[];
}

interface GraphNode {
    key: string;
    label: string;
    secondary: string;
}

interface TooltipGeometry {
    xAlign?: string;
    yAlign?: string;
    caretX: number;
    caretY: number;
    x: number;
    y: number;
}

export function formatFlowPercent(flow: number) {
    const flowPct = flow * 100;
    return flowPct === 0 ? '0%' : flowPct < 1 ? '< 1%' : `${flowPct.toFixed(0)}%`;
}

export function getTooltipCaretStyle(tooltip: TooltipGeometry): CSSProperties {
    const caretSize = 8;
    const bgColor = 'white';
    const xAlign = tooltip.xAlign || 'center';
    const yAlign = tooltip.yAlign || 'center';
    const caretRelY = tooltip.caretY - tooltip.y;
    const caretRelX = tooltip.caretX - tooltip.x;

    if (xAlign === 'left') {
        return {
            left: -caretSize,
            top: caretRelY,
            transform: 'translateY(-50%)',
            borderTop: `${caretSize}px solid transparent`,
            borderBottom: `${caretSize}px solid transparent`,
            borderRight: `${caretSize}px solid ${bgColor}`,
        };
    }

    if (xAlign === 'right') {
        return {
            right: -caretSize,
            top: caretRelY,
            transform: 'translateY(-50%)',
            borderTop: `${caretSize}px solid transparent`,
            borderBottom: `${caretSize}px solid transparent`,
            borderLeft: `${caretSize}px solid ${bgColor}`,
        };
    }

    if (yAlign === 'bottom') {
        return {
            bottom: -caretSize,
            left: caretRelX,
            transform: 'translateX(-50%)',
            borderLeft: `${caretSize}px solid transparent`,
            borderRight: `${caretSize}px solid transparent`,
            borderTop: `${caretSize}px solid ${bgColor}`,
        };
    }

    return {
        top: -caretSize,
        left: caretRelX,
        transform: 'translateX(-50%)',
        borderLeft: `${caretSize}px solid transparent`,
        borderRight: `${caretSize}px solid transparent`,
        borderBottom: `${caretSize}px solid ${bgColor}`,
    };
}

function collectConceptMeta(explanation: ITransferLearningExplanation) {
    const conceptMeta = new Map<number, ConceptMeta>();

    const upsertConceptMeta = (classId: number, className: string, probability: number, imageUrls: string[]) => {
        const current = conceptMeta.get(classId);
        conceptMeta.set(classId, {
            className,
            maxWeight: Math.max(current?.maxWeight || 0, probability),
            imageUrls: current?.imageUrls?.length ? current.imageUrls : imageUrls,
        });
    };

    explanation.userClassProfiles.forEach((profile) => {
        profile.topConcepts.forEach((concept) => {
            upsertConceptMeta(concept.classId, concept.className, concept.probability, concept.imageUrls ?? []);
        });
    });

    explanation.currentImageTopConcepts.forEach((concept) => {
        upsertConceptMeta(concept.classId, concept.className, concept.probability, concept.imageUrls ?? []);
    });

    return conceptMeta;
}

function getOrderedLinks(links: TransferLearningGraphLink[]) {
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

    return [...links].sort((a, b) => {
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
}

export function buildTransferLearningGraphData(
    explanation: ITransferLearningExplanation | null,
    t: TFunction
): TransferLearningGraphData | null {
    if (!explanation || explanation.userClassProfiles.length === 0) return null;

    const conceptMeta = collectConceptMeta(explanation);
    const rightNodesBase = [...conceptMeta.entries()].sort((a, b) => b[1].maxWeight - a[1].maxWeight);

    const conceptImageUrls: Record<string, string[]> = {};
    rightNodesBase.forEach(([classId, meta]) => {
        conceptImageUrls[`concept${classId}`] = meta.imageUrls;
    });

    const rightNodeByConcept = new Map<number, string>();
    rightNodesBase.forEach(([classId]) => {
        rightNodeByConcept.set(classId, `concept${classId}`);
    });

    const leftNodesBase: GraphNode[] = [
        {
            key: 'currentInput',
            label: t('charts.transferLearningCurrentInput'),
            secondary: '',
        },
        ...explanation.userClassProfiles.map((profile) => ({
            key: `class${profile.userClassIndex}`,
            label: profile.userClassLabel,
            secondary: '',
        })),
    ];

    const links: TransferLearningGraphLink[] = [];

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
        labels[key] = meta.className.split(',')[0].trim();
        columns[key] = 1;
        priority[key] = index;
    });

    const maxNodesPerColumn = Math.max(leftNodesBase.length, rightNodesBase.length);
    const chartHeight = Math.max(320, 120 + maxNodesPerColumn * 56);

    return {
        links: getOrderedLinks(links),
        labels,
        columns,
        priority,
        sourceIndexByKey,
        conceptImageUrls,
        chartHeight,
    };
}
