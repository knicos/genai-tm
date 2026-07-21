import { useMemo } from 'react';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { useVariant } from '@genaitm/util/variant';
import { Help } from '@genai-fi/base';
import { transferLearningExplanation } from '../../../state';
import style from './TransferLearningMatrix.module.css';
import chartStyle from '../Charts.module.css';
import underTheHoodStyle from '../UnderTheHood.module.css';

function toPercent(value: number) {
    const pct = Math.max(0, value) * 100;
    return pct === 0 ? '0%' : pct < 1 ? '< 1%' : `${pct.toFixed(0)}%`;
}

export function TransferLearningMatrix() {
    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);
    const explanation = useAtomValue(transferLearningExplanation);

    const conceptColumns = useMemo(() => {
        if (!explanation) return [];

        const conceptMap = new Map<number, string>();

        explanation.userClassProfiles.forEach((profile) => {
            profile.topConcepts.forEach((concept) => {
                conceptMap.set(concept.classId, concept.className);
            });
        });

        explanation.currentImageTopConcepts.forEach((concept) => {
            conceptMap.set(concept.classId, concept.className);
        });

        return [...conceptMap.entries()].map(([classId, className]) => ({ classId, className }));
    }, [explanation]);

    const currentImageConceptMap = useMemo(() => {
        const map = new Map<number, number>();
        if (!explanation) return map;
        explanation.currentImageTopConcepts.forEach((concept) => {
            map.set(concept.classId, concept.probability);
        });
        return map;
    }, [explanation]);

    const similarityMap = useMemo(() => {
        const map = new Map<number, number>();
        if (!explanation) return map;
        explanation.userClassSimilarity.forEach((item) => {
            map.set(item.userClassIndex, item.score);
        });
        return map;
    }, [explanation]);

    if (!explanation || conceptColumns.length === 0 || explanation.userClassProfiles.length === 0) {
        return null;
    }

    return (
        <section className={chartStyle.section}>
            <div className={chartStyle.titleRow}>
                <div className={`${underTheHoodStyle.heatmapLabel} ${chartStyle.title}`}>
                    {t('charts.transferLearningMatrix')}
                </div>
                <Help
                    inplace
                    message={t('charts.transferLearningMatrixHelp')}
                    dark
                />
            </div>

            <div className={style.scroll}>
                <table className={style.table}>
                    <thead>
                        <tr>
                            <th className={style.rowHeader}>{t('charts.transferLearningUserClass')}</th>
                            {conceptColumns.map((concept) => (
                                <th key={concept.classId}>{concept.className}</th>
                            ))}
                            <th className={style.similarity}>
                                <div className={style.similarityHeaderContent}>
                                    <span>{t('charts.transferLearningSimilarity')}</span>
                                    <Help
                                        inplace
                                        message={t('charts.transferLearningSimilarityHelp')}
                                        dark
                                    />
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr className={style.currentInputRow}>
                            <th className={style.rowHeader}>{t('charts.transferLearningCurrentInput')}</th>
                            {conceptColumns.map((concept) => {
                                const probability = currentImageConceptMap.get(concept.classId) || 0;
                                return <td key={concept.classId}>{toPercent(probability)}</td>;
                            })}
                            <td className={style.similarity}>—</td>
                        </tr>

                        {explanation.userClassProfiles.map((profile) => {
                            const conceptMap = new Map<number, number>();
                            profile.topConcepts.forEach((concept) => {
                                conceptMap.set(concept.classId, concept.probability);
                            });

                            const similarity = similarityMap.get(profile.userClassIndex);

                            return (
                                <tr key={profile.userClassIndex}>
                                    <th className={style.rowHeader}>
                                        {profile.userClassLabel} ({profile.sampleCount})
                                    </th>
                                    {conceptColumns.map((concept) => {
                                        const probability = conceptMap.get(concept.classId) || 0;
                                        return (
                                            <td
                                                key={concept.classId}
                                                className={probability >= 0.3 ? style.valueStrong : undefined}
                                            >
                                                {toPercent(probability)}
                                            </td>
                                        );
                                    })}
                                    <td className={style.similarity}>
                                        {similarity !== undefined
                                            ? similarity === 0
                                                ? '0%'
                                                : similarity < 0.01
                                                ? '< 1%'
                                                : `${(similarity * 100).toFixed(0)}%`
                                            : '—'}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </section>
    );
}
