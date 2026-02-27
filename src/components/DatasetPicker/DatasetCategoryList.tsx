import { memo, useState, useMemo, useCallback, forwardRef, useImperativeHandle, Fragment, useRef } from 'react';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';
import { useTranslation } from 'react-i18next';
import { Dataset } from '@genaitm/util/datasets';
import { useVariant } from '@genaitm/util/variant';
import DatasetCategory from './DatasetCategory';
import styles from './DatasetPicker.module.css';

export interface DatasetCategoryListHandle {
    getSelectedImages: () => { url: string }[];
    clearSelection: () => void;
}

interface DatasetCategoryListProps {
    datasets: Dataset[];
    onSelectionChange: (count: number) => void;
}

const DatasetCategoryList = memo(
    forwardRef<DatasetCategoryListHandle, DatasetCategoryListProps>(
    ({ datasets, onSelectionChange }, ref) => {
        const { namespace } = useVariant();
        const { t } = useTranslation(namespace);
        const [searchQuery, setSearchQuery] = useState('');

        // All selected image URLs. Mutated directly; no state needed because
        // onSelectionChange(count) drives the parent's UI, not this component.
        const selectedUrlsRef = useRef<Set<string>>(new Set());
        // Incrementing clearGen is used only as a React key on the categories wrapper.
        // Changing it remounts all category/item children, resetting their local state
        // without any prop threading.
        const [clearGen, setClearGen] = useState(0);

        useImperativeHandle(ref, () => ({
            getSelectedImages: () => [...selectedUrlsRef.current].map((url) => ({ url })),
            clearSelection: () => {
                selectedUrlsRef.current.clear();
                onSelectionChange(0);
                setClearGen((g) => g + 1);
            },
        }), [onSelectionChange]);

        // Stable callback — only changes if onSelectionChange itself changes (it's a state setter, so never).
        const handleSelectionChange = useCallback((added: string[], removed: string[]) => {
            added.forEach((url) => selectedUrlsRef.current.add(url));
            removed.forEach((url) => selectedUrlsRef.current.delete(url));
            onSelectionChange(selectedUrlsRef.current.size);
        }, [onSelectionChange]);

        const datasetsByCategory = useMemo(
            () =>
                datasets.reduce((acc: Record<string, Dataset[]>, dataset) => {
                    if (!acc[dataset.categoryKey]) acc[dataset.categoryKey] = [];
                    acc[dataset.categoryKey].push(dataset);
                    return acc;
                }, {}),
            [datasets]
        );

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
                <Fragment key={clearGen}>
                    {Object.entries(filteredByCategory).map(([categoryKey, cats]) => (
                        <Fragment key={categoryKey}>
                            {cats.length > 0 && (
                                <DatasetCategory
                                    categoryKey={categoryKey}
                                    datasets={cats}
                                    onSelectionChange={handleSelectionChange}
                                />
                            )}
                        </Fragment>
                    ))}
                </Fragment>
            </>
        );
    })
);

DatasetCategoryList.displayName = 'DatasetCategoryList';
export default DatasetCategoryList;

