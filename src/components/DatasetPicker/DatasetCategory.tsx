import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { useVariant } from '@genaitm/util/variant';
import DatasetItem from './DatasetItem';
import styles from './DatasetPicker.module.css';
import { Dataset } from '@genaitm/util/datasets';

interface DatasetCategoryProps {
    categoryKey: string;
    datasets: Dataset[];
    onSelectionChange?: (added: string[], removed: string[]) => void;
    singleSelect?: boolean;
    onImageClick?: (url: string) => void;
    selectedImageUrl?: string | null;
}

const DatasetCategory = memo(function DatasetCategory({
    categoryKey,
    datasets,
    onSelectionChange,
    singleSelect = false,
    onImageClick,
    selectedImageUrl = null,
}: DatasetCategoryProps) {
    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);

    return (
        <div className={styles.categoryBox}>
            <h3 className={styles.categoryTitle}>
                {t(categoryKey)}
            </h3>
            {datasets.map((dataset) => (
                <DatasetItem
                    key={dataset.id}
                    dataset={dataset}
                    singleSelect={singleSelect}
                    onSelectionChange={onSelectionChange}
                    onImageClick={onImageClick}
                    selectedImageUrl={selectedImageUrl}
                />
            ))}
        </div>
    );
});

export default DatasetCategory;
