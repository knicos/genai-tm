import { useState, useRef } from 'react';
import Checkbox from '@mui/material/Checkbox';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ImageTile from './ImageTile';
import styles from './DatasetPicker.module.css';
import { Dataset } from '@genaitm/util/datasets';
import { useTranslation } from 'react-i18next';
import { useVariant } from '@genaitm/util/variant';

const PREVIEW_IMAGE_COUNT = 5;

interface DatasetItemProps {
    dataset: Dataset;
    isTestMode?: boolean;
    isImageSelected?: (datasetId: string, imageIndex: number) => boolean;
    handleImageToggle?: (datasetId: string, imageIndex: number, url: string) => void;
    handleImportAll?: (dataset: Dataset, checked: boolean) => void;
    getSelectedCountForDataset?: (datasetId: string) => number;
    onImageClick?: (url: string) => void;
    selectedImageUrl?: string | null;
}

export default function DatasetItem({
    dataset,
    isTestMode = false,
    isImageSelected = () => false,
    handleImageToggle = () => {},
    handleImportAll = () => {},
    getSelectedCountForDataset = () => 0,
    onImageClick,
    selectedImageUrl = null,
}: DatasetItemProps) {
    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);
    const [isExpanded, setIsExpanded] = useState(false);
    const failedUrls = useRef<Set<string>>(new Set());

    const selectedCount = getSelectedCountForDataset(dataset.id);
    const allSelected = selectedCount === dataset.images.length;
    const imagesToShow = isExpanded ? dataset.images : dataset.images.slice(0, PREVIEW_IMAGE_COUNT);
    const hasMoreImages = dataset.images.length > PREVIEW_IMAGE_COUNT;

    return (
        <div className={styles.datasetBox}>
            <div className={`${styles.datasetHeader} ${isTestMode ? styles.test : ''}`}>
                {!isTestMode && (
                    <Checkbox
                        checked={allSelected}
                        indeterminate={selectedCount > 0 && !allSelected}
                        onChange={(e) => handleImportAll(dataset, e.target.checked)}
                    />
                )}
                <Typography variant="subtitle1" className={styles.datasetName}>
                    {t(dataset.nameKey)}
                </Typography>
                <Typography variant="caption" className={styles.imageCount}>
                    ({dataset.images.length} {t('trainingdata.labels.images')})
                </Typography>
                {!isTestMode && selectedCount > 0 && (
                    <Typography variant="caption" className={styles.selectedCount}>
                        {selectedCount} {t('trainingdata.labels.selected')}
                    </Typography>
                )}
            </div>

            <div className={styles.imagesRow}>
                {imagesToShow.map((image, idx) => {
                    const hasFailed = failedUrls.current.has(image.url);
                    const selected = isTestMode ? selectedImageUrl === image.url : isImageSelected(dataset.id, idx);
                    const onClick = isTestMode
                        ? () => !hasFailed && onImageClick?.(image.url)
                        : () => !hasFailed && handleImageToggle(dataset.id, idx, image.url);
                    return (
                        <ImageTile
                            key={image.url}
                            url={image.url}
                            alt={t(dataset.nameKey, { index: idx + 1 })}
                            imgClassName={isTestMode ? styles.testImage : styles.datasetImage}
                            selected={selected}
                            containerSelected={!isTestMode}
                            showCheckbox={!isTestMode && !hasFailed}
                            checked={selected}
                            onCheckboxChange={isTestMode ? undefined : () => handleImageToggle(dataset.id, idx, image.url)}
                            onClick={onClick}
                            loading="lazy"
                            onError={() => { failedUrls.current.add(image.url); }}
                            hasFailed={hasFailed}
                        />
                    );
                })}

                {hasMoreImages && !isExpanded && (
                    <Box className={styles.expandButton} onClick={() => setIsExpanded(true)}>
                        <Typography variant="caption" className={styles.expandButtonText}>
                            {t('trainingdata.actions.displayMore', { count: dataset.images.length })}
                        </Typography>
                    </Box>
                )}
            </div>
        </div>
    );
}
