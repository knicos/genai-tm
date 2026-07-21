import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { modelStats } from '../../../state';
import styles from '../Charts.module.css';
import { useVariant } from '@genaitm/util/variant';
import { Help } from '@genai-fi/base';

export function AccuracyPerClass() {
    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);
    const stats = useAtomValue(modelStats);

    if (!stats.accuracyPerClass || stats.accuracyPerClass.length === 0) {
        return null;
    }

    return (
        <div className={styles.chartContainer}>
            <div className={styles.chartTitleRow}>
                <h3 className={styles.chartTitle}>{t('charts.accuracyPerClass')}</h3>
                <Help
                    inplace
                    message={t('charts.accuracyPerClassHelp')}
                    dark
                />
            </div>
            <table className={styles.table}>
                <thead>
                    <tr className={styles.tableHeader}>
                        <th className={styles.tableHeaderCell}>{t('charts.class')}</th>
                        <th className={styles.tableHeaderCell}>{t('charts.accuracy')}</th>
                        <th className={styles.tableHeaderCell}>{t('charts.testSamples')}</th>
                    </tr>
                </thead>
                <tbody>
                    {stats.accuracyPerClass.map((item, index) => (
                        <tr
                            key={index}
                            className={styles.tableRow}
                        >
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
