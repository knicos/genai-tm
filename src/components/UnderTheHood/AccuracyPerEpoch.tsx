import { useMemo } from 'react';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { trainingHistory } from '../../state';
import styles from './Charts.module.css';
import { LineChart } from '@mui/x-charts/LineChart';
import { useVariant } from '@genaitm/util/variant';

export function AccuracyPerEpoch() {
    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);
    const history = useAtomValue(trainingHistory);

    const dataset = useMemo(() => history.map(h => ({
        epoch: h.epoch,
        accuracy: h.accuracy,
        valAccuracy: h.valAccuracy ?? 0
    })), [history]);

    const series = useMemo(() => {
        const result = [
            {
                dataKey: 'accuracy',
                label: t('charts.acc'),
                color: 'rgb(25, 118, 210)',
                showMark: false
            }
        ];

        if (history.some(h => h.valAccuracy !== undefined)) {
            result.push({
                dataKey: 'valAccuracy',
                label: t('charts.testAcc'),
                color: 'rgb(255, 152, 0)',
                showMark: false
            });
        }

        return result;
    }, [history, t]);

    const maxEpoch = useMemo(() => Math.max(...history.map(h => h.epoch), 0), [history]);

    if (history.length === 0) {
        return null;
    }

    return (
        <div className={styles.chartContainer}>
            <h3 className={styles.chartTitle}>
                {t('charts.accuracyPerEpoch')}
            </h3>
            <div className={styles.chartScrollWrapper}>
                <div style={{ minWidth: Math.max(300, maxEpoch * 6) + 'px' }}>
                    <LineChart
                        dataset={dataset}
                        xAxis={[{
                            data: history.map(h => h.epoch),
                            label: t('charts.epochs'),
                            scaleType: 'linear',
                            min: 0,
                            max: maxEpoch,
                            tickNumber: 10,
                            valueFormatter: (value) => `${t('charts.epoch')} ${Math.round(value)}`
                        }]}
                        yAxis={[{
                            label: t('charts.accuracy'),
                            min: 0,
                            max: 1
                        }]}
                        series={series}
                        height={250}
                        slotProps={{
                            legend: {
                                position: { vertical: 'middle', horizontal: 'center' }
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
