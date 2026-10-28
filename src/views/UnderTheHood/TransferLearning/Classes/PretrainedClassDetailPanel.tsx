import { useTranslation } from 'react-i18next';
import { useVariant } from '@genaitm/util/variant';
import style from './PretrainedClassMap.module.css';
import type { ClassMapItem } from './PretrainedClassMap';
import { DETAIL_IMAGE_LIMIT, formatPercent } from './PretrainedClassMap.utils';

interface Props {
    item: ClassMapItem;
}

export function PretrainedClassDetailPanel({ item }: Props) {
    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);

    return (
        <aside className={style.detailPanel}>
            <div className={style.detailClassId}>{t('charts.imagenetClassMapClassId', { id: item.classId + 1 })}</div>
            <div className={style.detailTitle}>{item.className}</div>
            <div className={style.detailProbability}>{formatPercent(item.probability)}</div>
            <div className={style.sampleGrid}>
                {item.imageUrls.slice(0, DETAIL_IMAGE_LIMIT).map((imageUrl, index) => (
                    <img
                        key={imageUrl}
                        src={imageUrl}
                        alt={t('charts.pretrainedSampleAlt', {
                            label: item.className,
                            index: index + 1,
                        })}
                        loading="eager"
                        decoding="async"
                        fetchPriority="high"
                        draggable={false}
                        className={style.sampleImage}
                    />
                ))}
            </div>
        </aside>
    );
}
