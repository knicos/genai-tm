import { useState, useMemo, useCallback, forwardRef, useImperativeHandle, Fragment } from 'react';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';
import { Dataset } from '@genaitm/util/datasets';
import { useVariant } from '@genaitm/util/variant';
import DatasetCategory from './DatasetCategory';
import styles from './DatasetPicker.module.css';

interface SelectedImage {
    datasetId: string;
    imageIndex: number;
    url: string;
}

export interface DatasetCategoryListHandle {
    getSelectedImages: () => { url: string }[];
    clearSelection: () => void;
}

interface DatasetCategoryListProps {
    datasets: Dataset[];
    onSelectionChange: (count: number) => void;
}

const DatasetCategoryList = forwardRef<DatasetCategoryListHandle, DatasetCategoryListProps>(
    ({ datasets, onSelectionChange }, ref) => {
        const { namespace } = useVariant();
        const { t } = useTranslation(namespace);
        const [searchQuery, setSearchQuery] = useState('');
        const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);

        useImperativeHandle(ref, () => ({
            getSelectedImages: () => selectedImages.map((img) => ({ url: img.url })),
            clearSelection: () => {
                setSelectedImages([]);
                onSelectionChange(0);
            },
        }));

        const datasetsByCategory = useMemo(() =>
            datasets.reduce((acc: Record<string, Dataset[]>, dataset) => {
                if (!acc[dataset.categoryKey]) acc[dataset.categoryKey] = [];
                acc[dataset.categoryKey].push(dataset);
                return acc;
            }, {}),
        [datasets]);

        const q = searchQuery.trim().toLowerCase();
        const filteredByCategory = useMemo(() => {
            return Object.fromEntries(
                Object.entries(datasetsByCategory).map(([categoryKey, cats]) => {
                    if (!q) return [categoryKey, cats];
                    if (t(categoryKey).toLowerCase().includes(q)) return [categoryKey, cats];
                    return [categoryKey, cats.filter((d) => t(d.nameKey).toLowerCase().includes(q))];
                })
            );
        }, [datasetsByCategory, q, t]);

        const handleImageToggle = useCallback(
            (datasetId: string, imageIndex: number, url: string) => {
                setSelectedImages((prev) => {
                    const exists = prev.find(
                        (img) => img.datasetId === datasetId && img.imageIndex === imageIndex
                    );
                    const next = exists
                        ? prev.filter((img) => !(img.datasetId === datasetId && img.imageIndex === imageIndex))
                        : [...prev, { datasetId, imageIndex, url }];
                    onSelectionChange(next.length);
                    return next;
                });
            },
            [onSelectionChange]
        );

        const handleImportAll = useCallback(
            (dataset: Dataset, checked: boolean) => {
                setSelectedImages((prev) => {
                    const withoutDataset = prev.filter((img) => img.datasetId !== dataset.id);
                    const next = checked
                        ? [...withoutDataset, ...dataset.images.map((img, idx) => ({ datasetId: dataset.id, imageIndex: idx, url: img.url }))]
                        : withoutDataset;
                    onSelectionChange(next.length);
                    return next;
                });
            },
            [onSelectionChange]
        );

        const isImageSelected = useCallback(
            (datasetId: string, imageIndex: number) =>
                selectedImages.some((img) => img.datasetId === datasetId && img.imageIndex === imageIndex),
            [selectedImages]
        );

        const getSelectedCountForDataset = useCallback(
            (datasetId: string) => selectedImages.filter((img) => img.datasetId === datasetId).length,
            [selectedImages]
        );

        return (
            <>
                <TextField
                    fullWidth
                    placeholder={t('trainingdata.labels.searchDataset')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.searchField}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        },
                    }}
                />
                {Object.entries(filteredByCategory).map(([categoryKey, cats]) => (
                    <Fragment key={categoryKey}>
                        {cats.length > 0 && (
                            <DatasetCategory
                                categoryKey={categoryKey}
                                datasets={cats}
                                isImageSelected={isImageSelected}
                                handleImageToggle={handleImageToggle}
                                handleImportAll={handleImportAll}
                                getSelectedCountForDataset={getSelectedCountForDataset}
                            />
                        )}
                    </Fragment>
                ))}
            </>
        );
    }
);

DatasetCategoryList.displayName = 'DatasetCategoryList';
export default DatasetCategoryList;
