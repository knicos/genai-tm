import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { modelStats } from '../../state';
import styles from './Charts.module.css';
import { useVariant } from '@genaitm/util/variant';

export function AccuracyPerClass() {
    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);
    const stats = useAtomValue(modelStats);

    if (!stats.accuracyPerClass || stats.accuracyPerClass.length === 0) {
        return null;
    }

    return (
        <div className={styles.chartContainer}>
            <h3 className={styles.chartTitle}>
                {t('charts.accuracyPerClass')}
            </h3>
            <table className={styles.table}>
                <thead>
                    <tr className={styles.tableHeader}>
                        <th className={styles.tableHeaderCell}>{t('charts.class')}</th>
                        <th className={styles.tableHeaderCell}>{t('charts.accuracy')}</th>
                        <th className={styles.tableHeaderCell}>{t('charts.samples')}</th>
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
