import { useCallback, useState, useRef, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { Button } from '@genaitm/components/button/Button';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import FolderIcon from '@mui/icons-material/Folder';
import { useTranslation } from 'react-i18next';
import { Dataset, DATASETS, fetchAndCacheDatasets, DatasetImage } from '@genaitm/util/datasets';
import { loadDatasetImagesInParallel, LoadProgress } from '@genaitm/util/datasetLoader';
import { useVariant } from '@genaitm/util/variant';
import DatasetCategoryList, { DatasetCategoryListHandle } from './DatasetCategoryList';
import styles from './DatasetPicker.module.css';

interface DatasetPickerProps {
    open: boolean;
    onClose: () => void;
    onDatasetSelected: (canvases: HTMLCanvasElement[]) => void;
}

export default function DatasetPicker({ open, onClose, onDatasetSelected }: DatasetPickerProps) {
    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);
    const [loading, setLoading] = useState(false);
    const [loadProgress, setLoadProgress] = useState<LoadProgress>({ loaded: 0, total: 0 });
    const [localDatasets, setLocalDatasets] = useState<Dataset[]>(DATASETS);
    const [selectedCount, setSelectedCount] = useState(0);
    const listRef = useRef<DatasetCategoryListHandle>(null);

    useEffect(() => {
        if (!open) return;
        if (DATASETS.length > 0) {
            setLocalDatasets([...DATASETS]);
            return;
        }
        fetchAndCacheDatasets().then(setLocalDatasets);
    }, [open]);

    const handleUse = useCallback(async () => {
        const images = listRef.current?.getSelectedImages() ?? [];
        if (images.length === 0) return;

        setLoading(true);
        setLoadProgress({ loaded: 0, total: images.length });

        try {
            const canvases = await loadDatasetImagesInParallel(images as DatasetImage[], (progress) => {
                setLoadProgress(progress);
            });

            if (canvases.length > 0) {
                onDatasetSelected(canvases);
                listRef.current?.clearSelection();
                onClose();
            } else {
                alert(t('trainingdata.labels.datasetLoadError'));
            }
        } catch (error) {
            console.error('Error loading images:', error);
            alert(t('trainingdata.labels.datasetLoadError'));
        } finally {
            setLoading(false);
        }
    }, [onDatasetSelected, onClose, t]);

    const handleClose = useCallback(() => {
        if (!loading) {
            listRef.current?.clearSelection();
            onClose();
        }
    }, [loading, onClose]);

    const progressPercentage =
        loadProgress.total > 0 ? (loadProgress.loaded / loadProgress.total) * 100 : 0;

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="lg"
            fullWidth
            slotProps={{ paper: { className: styles.dialogPaper } }}
        >
            <DialogTitle className={styles.dialogTitle}>
                <FolderIcon />
                {t('trainingdata.labels.selectDataset')}
            </DialogTitle>
            <DialogContent>
                {loading ? (
                    <div className={styles.loadingContainer}>
                        <Typography variant="body1" gutterBottom>
                            {t('trainingdata.labels.loadingDataset', {
                                loaded: loadProgress.loaded,
                                total: loadProgress.total,
                            })}
                        </Typography>
                        <LinearProgress
                            variant="determinate"
                            value={progressPercentage}
                            className={styles.loadingProgress}
                        />
                    </div>
                ) : (
                    <DatasetCategoryList
                        ref={listRef}
                        datasets={localDatasets}
                        onSelectionChange={setSelectedCount}
                    />
                )}
            </DialogContent>
            <DialogActions className={styles.dialogActions}>
                <Button variant="outlined" onClick={handleClose} disabled={loading}>
                    {t('trainingdata.actions.cancel')}
                </Button>
                <Button
                    onClick={handleUse}
                    disabled={loading || selectedCount === 0}
                    variant="contained"
                >
                    {loading
                        ? t('trainingdata.labels.loading')
                        : t('trainingdata.actions.use', { count: selectedCount })}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
