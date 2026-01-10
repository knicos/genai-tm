import { useMemo } from 'react';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { trainingHistory } from '../../state';
import styles from './Charts.module.css';
import { LineChart } from '@mui/x-charts/LineChart';
import { useVariant } from '@genaitm/util/variant';

export function LossPerEpoch() {
    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);
    const history = useAtomValue(trainingHistory);

    const dataset = useMemo(() => history.map(h => ({
        epoch: h.epoch,
        loss: h.loss,
        valLoss: h.valLoss ?? 0
    })), [history]);

    const series = useMemo(() => {
        const result = [
            {
                dataKey: 'loss',
                label: t('charts.loss'),
                color: 'rgb(25, 118, 210)',
                showMark: false
            }
        ];

        if (history.some(h => h.valLoss !== undefined)) {
            result.push({
                dataKey: 'valLoss',
                label: t('charts.testLoss'),
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
                {t('charts.lossPerEpoch')}
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
                            label: t('charts.loss'),
                            min: 0
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
