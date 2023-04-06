import React, { useCallback, useRef } from 'react';
import style from './Behaviour.module.css';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { Skeleton } from '@mui/material';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { VerticalButton } from '../button/Button';
import IconImage from '../IconImage/IconImage';
import { useTranslation } from 'react-i18next';
import { useVariant } from '../../util/variant';
import { useDrop } from 'react-dnd';
import { NativeTypes } from 'react-dnd-html5-backend';
import UploadIcon from '@mui/icons-material/Upload';

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
    const fileRef = useRef<HTMLInputElement>(null);

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

    const [dropProps, drop] = useDrop({
        accept: [NativeTypes.FILE, NativeTypes.URL],
        drop(items: any) {
            onDrop(items.files);
        },
        canDrop(item: any) {
            for (const i of item?.files) {
                if (!i.type.startsWith('image/')) return false;
            }
            return true;
        },
        collect(monitor) {
            const can = monitor.canDrop();
            return {
                highlighted: can,
                hovered: monitor.isOver() && can,
            };
        },
    });

    const doDelete = useCallback(() => {
        setBehaviour(undefined);
    }, [setBehaviour]);

    const doUploadClick = useCallback(() => fileRef.current?.click(), []);

    const onFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            onDrop(Array.from(e.target.files || []));
        },
        [onDrop]
    );

    return (
        <div
            ref={drop}
            className={style.imageContainer}
        >
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
                    />
                )}
                {dropProps.hovered && (
                    <div className={style.dropImage}>
                        <UploadIcon />
                    </div>
                )}
            </div>
        </div>
    );
}
