import { useCallback, useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import FolderIcon from '@mui/icons-material/Folder';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import { useTranslation } from 'react-i18next';
import { Dataset, DATASETS, fetchAndCacheDatasets } from '@genaitm/util/datasets';
import { canvasFromURL } from '@genai-fi/base';
import { useVariant } from '@genaitm/util/variant';
import styles from '../DatasetPicker/DatasetPicker.module.css';
import { ScrollRootContext, useScrollRootRef } from '../DatasetPicker/ScrollRootContext';
import DatasetTestCategoryList from './DatasetTestCategoryList';

interface DatasetTestPickerProps {
    open: boolean;
    onClose: () => void;
    onImageSelected?: (canvas: HTMLCanvasElement) => void;
    onImageUrlSelected?: (url: string) => void;
}

export default function DatasetTestPicker({
    open,
    onClose,
    onImageSelected,
    onImageUrlSelected,
}: DatasetTestPickerProps) {
    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);
    const [localDatasets, setLocalDatasets] = useState<Dataset[]>(DATASETS);
    const [scrollRoot, scrollRootRef] = useScrollRootRef();

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
                onImageUrlSelected?.(url);

                if (onImageSelected) {
                    const canvas = await canvasFromURL(url);
                    if (canvas) {
                        onImageSelected(canvas);
                    }
                }
                onClose();
            } catch (error) {
                console.error('Error loading image:', error);
            }
        },
        [onImageSelected, onImageUrlSelected, onClose]
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
                <IconButton
                    onClick={onClose}
                    aria-label="close"
                    className={styles.closeButton}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent ref={scrollRootRef}>
                <ScrollRootContext.Provider value={scrollRoot}>
                    <DatasetTestCategoryList
                        datasets={localDatasets}
                        open={open}
                        onImageClick={handleImageClick}
                    />
                </ScrollRootContext.Provider>
            </DialogContent>
        </Dialog>
    );
}
