import { useCallback, useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import FolderIcon from '@mui/icons-material/Folder';
import { useTranslation } from 'react-i18next';
import { Dataset, DATASETS, fetchAndCacheDatasets } from '@genaitm/util/datasets';
import { canvasFromURL } from '@genai-fi/base';
import { useVariant } from '@genaitm/util/variant';
import styles from '../DatasetPicker/DatasetPicker.module.css';
import DatasetTestCategoryList from './DatasetTestCategoryList';

interface DatasetTestPickerProps {
    open: boolean;
    onClose: () => void;
    onImageSelected: (canvas: HTMLCanvasElement) => void;
}

export default function DatasetTestPicker({ open, onClose, onImageSelected }: DatasetTestPickerProps) {
    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);
    const [localDatasets, setLocalDatasets] = useState<Dataset[]>(DATASETS);

    useEffect(() => {
        if (!open) return;
        if (DATASETS.length > 0) {
            setLocalDatasets([...DATASETS]);
            return;
        }
        fetchAndCacheDatasets().then(setLocalDatasets);
    }, [open]);

    const handleImageClick = useCallback(
        async (url: string) => {
            try {
                const canvas = await canvasFromURL(url);
                if (canvas) {
                    onImageSelected(canvas);
                    setTimeout(() => onClose(), 100);
                }
            } catch (error) {
                console.error('Error loading image:', error);
            }
        },
        [onImageSelected, onClose]
    );

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            slotProps={{ paper: { className: styles.dialogPaper } }}
        >
            <DialogTitle className={styles.dialogTitle}>
                <FolderIcon />
                {t('trainingdata.labels.selectTestData')}
            </DialogTitle>
            <DialogContent>
                <DatasetTestCategoryList
                    datasets={localDatasets}
                    open={open}
                    onImageClick={handleImageClick}
                />
            </DialogContent>
        </Dialog>
    );
}
