import { Button } from '@genai-fi/base';
import { AudioExample } from '@genai-fi/classifier';
import { Skeleton } from '@mui/material';
import { useTeachableModel } from '@genaitm/util/TeachableModel';
import { useCallback, useEffect, useRef, useState } from 'react';
import style from './Input.module.css';
import { useTranslation } from 'react-i18next';
import { useVariant } from '@genaitm/util/variant';
import GridViewIcon from '@mui/icons-material/GridView';
import DatasetTestPicker from '@genaitm/components/DatasetTestPicker/DatasetTestPicker';

interface Props {
    example?: HTMLCanvasElement | AudioExample;
    enableInput: boolean;
    onExample: (example: HTMLCanvasElement | AudioExample) => void;
}

export default function DatasetInput({ example, onExample, enableInput }: Props) {
    const { namespace, sampleDatasets } = useVariant();
    const { t } = useTranslation(namespace);
    const { imageSize, canPredict } = useTeachableModel();
    const fileImageRef = useRef<HTMLDivElement>(null);
    const [showDatasetPicker, setShowDatasetPicker] = useState(false);

    const scaleToModelSize = useCallback(
        (canvas: HTMLCanvasElement): HTMLCanvasElement => {
            if (canvas.width === imageSize && canvas.height === imageSize) return canvas;
            const scaled = document.createElement('canvas');
            scaled.width = imageSize;
            scaled.height = imageSize;
            const ctx = scaled.getContext('2d');
            ctx?.drawImage(canvas, 0, 0, imageSize, imageSize);
            return scaled;
        },
        [imageSize]
    );

    useEffect(() => {
        if (fileImageRef.current && example && example instanceof HTMLCanvasElement) {
            example.style.width = '224px';
            example.style.height = '224px';
            while (fileImageRef.current.firstChild) {
                fileImageRef.current.removeChild(fileImageRef.current.firstChild);
            }
            fileImageRef.current.appendChild(example);
        }
    }, [example]);

    const handleDatasetImageSelected = useCallback(
        (canvas: HTMLCanvasElement) => {
            onExample(scaleToModelSize(canvas));
        },
        [scaleToModelSize, onExample]
    );

    const handleDatasetPickerOpen = useCallback(() => {
        setShowDatasetPicker(true);
    }, []);

    const handleDatasetPickerClose = useCallback(() => {
        setShowDatasetPicker(false);
    }, []);

    return (
        <>
            <div className={style.datasetActionsRow}>
                <Button
                    onClick={handleDatasetPickerOpen}
                    disabled={!canPredict || !enableInput}
                    startIcon={<GridViewIcon fontSize="large" />}
                    variant="outlined"
                >
                    {t('trainingdata.labels.selectDataset')}
                </Button>
            </div>
            {!!example && (
                <div
                    role="img"
                    aria-label={t('input.aria.imageFile')}
                    ref={fileImageRef}
                    className={style.fileImage}
                />
            )}
            {!example && (
                <Skeleton
                    sx={{ marginTop: '1rem' }}
                    variant="rounded"
                    width={224}
                    height={224}
                />
            )}
            {sampleDatasets && (
                <DatasetTestPicker
                    open={showDatasetPicker}
                    onClose={handleDatasetPickerClose}
                    onImageSelected={handleDatasetImageSelected}
                />
            )}
        </>
    );
}
