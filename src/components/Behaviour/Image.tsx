import React, { useCallback } from 'react';
import style from './Behaviour.module.css';
import { useDropzone } from 'react-dropzone';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { Skeleton } from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { VerticalButton } from '../button/Button';
import IconImage from '../IconImage/IconImage';
import { useTranslation } from 'react-i18next';
import { useVariant } from '../../util/variant';

export interface ImageBehaviour {
    uri: string;
}

interface Props {
    behaviour?: ImageBehaviour;
    setBehaviour: (behaviour: ImageBehaviour | undefined) => void;
}

export default function Image({ behaviour, setBehaviour }: Props) {
    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            if (acceptedFiles.length === 1) {
                const reader = new FileReader();
                reader.onabort = () => console.warn('file reading aborted');
                reader.onerror = () => console.error('file reading error');
                reader.onload = () => {
                    setBehaviour({
                        uri: reader.result as string,
                    });
                };
                reader.readAsDataURL(acceptedFiles[0]);
            }
        },
        [setBehaviour]
    );

    const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
        noClick: true,
        onDrop,
        accept: {
            'image/png': ['.png'],
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/gif': ['.gif'],
        },
        maxFiles: 1,
    });

    const doDelete = useCallback(() => {
        setBehaviour(undefined);
    }, [setBehaviour]);

    return (
        <div
            className={isDragActive ? style.imageContainerdrop : style.imageContainer}
            {...getRootProps()}
        >
            <VerticalButton
                variant="outlined"
                startIcon={<UploadFileIcon />}
                onClick={open}
            >
                {t('behaviours.actions.upload')}
            </VerticalButton>
            <VerticalButton
                variant="outlined"
                startIcon={<DeleteForeverIcon />}
                onClick={doDelete}
                disabled={!behaviour}
            >
                {t('behaviours.actions.delete')}
            </VerticalButton>
            <input {...getInputProps()} />
            {behaviour && (
                <IconImage
                    src={behaviour.uri}
                    onDelete={doDelete}
                />
            )}
            {!behaviour && (
                <Skeleton
                    variant="rounded"
                    width={58}
                    height={58}
                />
            )}
        </div>
    );
}
