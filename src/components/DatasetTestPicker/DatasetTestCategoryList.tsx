import { useState, useMemo, useCallback, useEffect, Fragment } from 'react';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';
import { Dataset } from '@genaitm/util/datasets';
import { useVariant } from '@genaitm/util/variant';
import DatasetCategory from '../DatasetPicker/DatasetCategory';
import styles from '../DatasetPicker/DatasetPicker.module.css';

interface DatasetTestCategoryListProps {
    datasets: Dataset[];
    open: boolean;
    onImageClick: (url: string) => void;
}

export default function DatasetTestCategoryList({ datasets, open, onImageClick }: DatasetTestCategoryListProps) {
    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);

    useEffect(() => {
        if (!open) {
            setSearchQuery('');
            setSelectedImageUrl(null);
        }
    }, [open]);

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

    const handleImageClick = useCallback((url: string) => {
        setSelectedImageUrl(url);
        onImageClick(url);
    }, [onImageClick]);

    return (
        <>
            <TextField
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
                            singleSelect={true}
                            onImageClick={handleImageClick}
                            selectedImageUrl={selectedImageUrl}
                        />
                    )}
                </Fragment>
            ))}
        </>
    );
}
