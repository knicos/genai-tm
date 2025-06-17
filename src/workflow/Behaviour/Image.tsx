import React, { useCallback, useRef } from 'react';
import style from './Behaviour.module.css';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import Skeleton from '@mui/material/Skeleton';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { VerticalButton } from '@genaitm/components/button/Button';
import IconImage from '@genaitm/components/IconImage/IconImage';
import { useTranslation } from 'react-i18next';
import { useVariant } from '../../util/variant';
import UploadIcon from '@mui/icons-material/Upload';

export interface ImageBehaviour {
    uri: string;
}

interface Props {
    behaviour?: ImageBehaviour;
    dropping?: boolean;
    setBehaviour: (behaviour: ImageBehaviour | undefined) => void;
}

export default function Image({ behaviour, setBehaviour, dropping }: Props) {
    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);
    const fileRef = useRef<HTMLInputElement>(null);

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            if (acceptedFiles.length === 1) {
                if (!acceptedFiles[0].type.startsWith('image/')) return;
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

    const doDelete = useCallback(() => {
        setBehaviour(undefined);
    }, [setBehaviour]);

    const doUploadClick = useCallback(() => fileRef.current?.click(), []);

    const onFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            onDrop(Array.from(e.target.files || []));
            e.target.value = '';
        },
        [onDrop]
    );

    return (
        <div className={style.imageContainer}>
            <input
                data-testid={`image-file-upload}`}
                hidden
                type="file"
                ref={fileRef}
                accept="image/*"
                onChange={onFileChange}
            />
            <VerticalButton
                data-testid="image-upload"
                variant="outlined"
                startIcon={<UploadFileIcon />}
                onClick={doUploadClick}
            >
                {t('behaviours.actions.upload')}
            </VerticalButton>
            <VerticalButton
                data-testid="image-delete"
                variant="outlined"
                startIcon={<DeleteForeverIcon />}
                onClick={doDelete}
                disabled={!behaviour}
            >
                {t('behaviours.actions.delete')}
            </VerticalButton>
            <div className={style.image}>
                {behaviour && (
                    <IconImage
                        role="img"
                        aria-label={t('behaviours.aria.imageOutput')}
                        src={behaviour.uri}
                        onDelete={doDelete}
                    />
                )}
                {!behaviour && (
                    <Skeleton
                        data-testid="image-skeleton"
                        variant="rounded"
                        width={58}
                        height={58}
                        role="img"
                        aria-label={t('behaviours.aria.noImage')}
                    />
                )}
                {dropping && (
                    <div className={style.dropImage}>
                        <UploadIcon />
                    </div>
                )}
            </div>
        </div>
    );
}
