import chartStyle from '../../Charts.module.css';
import {
    featureFlagsAtom,
    ITransferLearningClass,
    transferLearningExplanation,
} from '../../../../state';
import { useMemo } from 'react';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { useVariant } from '@genaitm/util/variant';
import { Help } from '@genai-fi/base';
import { PretrainedClassMapViewer } from './PretrainedClassMapViewer';
import { GRID_GAP, GRID_WIDTH } from './PretrainedClassMap.utils';
import { useSearchParams } from 'react-router';

export type ClassMapItem = ITransferLearningClass;

export interface ClassMapLayout {
    columns: number;
    width: number;
    height: number;
}

export interface PanPosition {
    x: number;
    y: number;
}

export function PretrainedClassMap() {
    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);
    const explanation = useAtomValue(transferLearningExplanation);
    const { allowClassMapFull } = useAtomValue(featureFlagsAtom);
    const [searchParams] = useSearchParams();
    const classMapParam = searchParams.get('allowClassMapFull');
    const allowViewer = classMapParam === null ? Boolean(allowClassMapFull) : classMapParam === 'true';
    const items = useMemo<ClassMapItem[]>(
        () => [...(explanation?.currentImageConcepts || [])].sort((a, b) => a.gridIndex - b.gridIndex),
        [explanation?.currentImageConcepts]
    );
    const layout = useMemo<ClassMapLayout>(() => {
        const columns = items.reduce((max, item) => Math.max(max, item.gridColumn + 1), 0);
        const rows = items.reduce((max, item) => Math.max(max, item.gridRow + 1), 0);
        const cellSize = columns > 0 ? (GRID_WIDTH - GRID_GAP * (columns - 1)) / columns : 0;

        return {
            columns,
            width: GRID_WIDTH,
            height: rows > 0 ? rows * cellSize + (rows - 1) * GRID_GAP : 0,
        };
    }, [items]);
    if (items.length === 0) {
        return null;
    }

    return (
        <section className={chartStyle.section}>
            <div className={chartStyle.titleRow}>
                <div className={chartStyle.title}>{t('charts.imagenetClassMapTitle')}</div>
                <Help
                    inplace
                    message={t('charts.imagenetClassMapHelp')}
                    dark
                />
            </div>

            <PretrainedClassMapViewer
                items={items}
                layout={layout}
                allowViewer={allowViewer}
            />
        </section>
    );
}
