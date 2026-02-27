import { memo, useState, useRef, useCallback, useEffect } from 'react';
import Checkbox from '@mui/material/Checkbox';
import ImageTile from './ImageTile';
import styles from './DatasetPicker.module.css';
import { Dataset } from '@genaitm/util/datasets';
import { useTranslation } from 'react-i18next';
import { useVariant } from '@genaitm/util/variant';

const PREVIEW_IMAGE_COUNT = 5;

interface DatasetItemProps {
    dataset: Dataset;
    singleSelect?: boolean;
    resetKey?: number;
    onSelectionChange?: (added: string[], removed: string[]) => void;
    onImageClick?: (url: string) => void;
    selectedImageUrl?: string | null;
}

const DatasetItem = memo(function DatasetItem({
    dataset,
    singleSelect = false,
    resetKey = 0,
    onSelectionChange,
    onImageClick,
    selectedImageUrl = null,
}: DatasetItemProps) {
    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);
    const [isExpanded, setIsExpanded] = useState(false);
    const failedUrls = useRef<Set<string>>(new Set());

    // selectedRef is the source of truth; selectedIndices is kept in sync to drive re-renders.
    const selectedRef = useRef<Set<number>>(new Set());
    const [selectedIndices, setSelectedIndices] = useState<ReadonlySet<number>>(() => new Set());

    // When the parent clears everything, reset local state.
    useEffect(() => {
        selectedRef.current = new Set();
        setSelectedIndices(new Set());
    }, [resetKey]);

    const handleImageToggle = useCallback(
        (idx: number) => {
            const url = dataset.images[idx]?.url;
            if (!url) return;
            const wasSelected = selectedRef.current.has(idx);
            if (wasSelected) selectedRef.current.delete(idx);
            else selectedRef.current.add(idx);
            setSelectedIndices(new Set(selectedRef.current));
            onSelectionChange?.(wasSelected ? [] : [url], wasSelected ? [url] : []);
        },
        [dataset.images, onSelectionChange]
    );

    const handleImportAll = useCallback(
        (checked: boolean) => {
            if (checked) {
                const added = dataset.images
                    .map((img, i) => ({ img, i }))
                    .filter(({ i }) => !selectedRef.current.has(i))
                    .map(({ img }) => img.url);
                selectedRef.current = new Set(dataset.images.map((_, i) => i));
                setSelectedIndices(new Set(selectedRef.current));
                if (added.length) onSelectionChange?.(added, []);
            } else {
                const removed = [...selectedRef.current].map((i) => dataset.images[i]?.url).filter(Boolean) as string[];
                selectedRef.current = new Set();
                setSelectedIndices(new Set());
                if (removed.length) onSelectionChange?.([], removed);
            }
        },
        [dataset.images, onSelectionChange]
    );

    const selectedCount = selectedIndices.size;
    const allSelected = selectedCount === dataset.images.length && dataset.images.length > 0;
    const imagesToShow = isExpanded ? dataset.images : dataset.images.slice(0, PREVIEW_IMAGE_COUNT);
    const hasMoreImages = dataset.images.length > PREVIEW_IMAGE_COUNT;

    return (
        <div className={styles.datasetBox}>
            <div className={`${styles.datasetHeader} ${singleSelect ? styles.test : ''}`}>
                {!singleSelect && (
                    <Checkbox
                        checked={allSelected}
                        indeterminate={selectedCount > 0 && !allSelected}
                        onChange={(e) => handleImportAll(e.target.checked)}
                    />
                )}
                <span className={styles.datasetName}>{t(dataset.nameKey)}</span>
                <span className={styles.imageCount}>
                    ({dataset.images.length} {t('trainingdata.labels.images')})
                </span>
                {!singleSelect && selectedCount > 0 && (
                    <span className={styles.selectedCount}>
                        {selectedCount} {t('trainingdata.labels.selected')}
                    </span>
                )}
            </div>

            <div className={styles.imagesRow}>
                {imagesToShow.map((image, idx) => {
                    const hasFailed = failedUrls.current.has(image.url);
                    const selected = singleSelect ? selectedImageUrl === image.url : selectedIndices.has(idx);
                    const onClick = singleSelect
                        ? () => !hasFailed && onImageClick?.(image.url)
                        : () => !hasFailed && handleImageToggle(idx);
                    return (
                        <ImageTile
                            key={image.url}
                            url={image.url}
                            alt={t(dataset.nameKey, { index: idx + 1 })}
                            imgClassName={singleSelect ? styles.testImage : styles.datasetImage}
                            selected={selected}
                            containerSelected={!singleSelect}
                            showCheckbox={!singleSelect && !hasFailed}
                            checked={selected}
                            onCheckboxChange={singleSelect ? undefined : () => handleImageToggle(idx)}
                            onClick={onClick}
                            onError={() => {
                                failedUrls.current.add(image.url);
                            }}
                            hasFailed={hasFailed}
                        />
                    );
                })}

                {hasMoreImages && !isExpanded && (
                    <div
                        className={styles.expandButton}
                        onClick={() => setIsExpanded(true)}
                    >
                        <span className={styles.expandButtonText}>
                            {t('trainingdata.actions.displayMore', { count: dataset.images.length })}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
});

export default DatasetItem;
