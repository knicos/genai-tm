import { useTranslation } from 'react-i18next';
import { useVariant } from '@genaitm/util/variant';
import Typography from '@mui/material/Typography';
import DatasetItem from './DatasetItem';
import styles from './DatasetPicker.module.css';
import { Dataset } from '@genaitm/util/datasets';

interface DatasetCategoryProps {
    categoryKey: string;
    datasets: Dataset[];
    isImageSelected?: (datasetId: string, imageIndex: number) => boolean;
    handleImageToggle?: (datasetId: string, imageIndex: number, url: string) => void;
    handleImportAll?: (dataset: Dataset, checked: boolean) => void;
    getSelectedCountForDataset?: (datasetId: string) => number;
    isTestMode?: boolean;
    onImageClick?: (url: string) => void;
    selectedImageUrl?: string | null;
}

export default function DatasetCategory({
    categoryKey,
    datasets,
    isImageSelected = () => false,
    handleImageToggle = () => {},
    handleImportAll = () => {},
    getSelectedCountForDataset = () => 0,
    isTestMode = false,
    onImageClick,
    selectedImageUrl = null,
}: DatasetCategoryProps) {
    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);

    return (
        <div className={styles.categoryBox}>
            <Typography variant="h6" gutterBottom className={styles.categoryTitle}>
                {t(categoryKey)}
            </Typography>
            {datasets.map((dataset) => (
                <DatasetItem
                    key={dataset.id}
                    dataset={dataset}
                    isTestMode={isTestMode}
                    isImageSelected={isImageSelected}
                    handleImageToggle={handleImageToggle}
                    handleImportAll={handleImportAll}
                    getSelectedCountForDataset={getSelectedCountForDataset}
                    onImageClick={onImageClick}
                    selectedImageUrl={selectedImageUrl}
                />
            ))}
        </div>
    );
}
