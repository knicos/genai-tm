import React from 'react';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import styles from './DatasetPicker.module.css';

interface ImageTileProps {
    url: string;
    alt?: string;
    imgClassName?: string;
    selected?: boolean;
    showCheckbox?: boolean;
    checked?: boolean;
    onCheckboxChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClick?: () => void;
    loading?: 'lazy' | 'eager';
    onError?: () => void;
    hasFailed?: boolean;
    containerSelected?: boolean;
}

export default function ImageTile({
    url,
    alt,
    imgClassName,
    selected,
    showCheckbox,
    checked,
    onCheckboxChange,
    onClick,
    loading,
    onError,
    hasFailed,
    containerSelected = false,
}: ImageTileProps) {
    return (
        <Box
            className={`${styles.imageContainer} ${containerSelected && selected ? styles.selected : ''}`}
            onClick={() => {
                if (!hasFailed && onClick) onClick();
            }}
            sx={hasFailed ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
        >
            {showCheckbox && !hasFailed && (
                <Checkbox
                    checked={!!checked}
                    className={styles.imageCheckbox}
                    onClick={(e) => e.stopPropagation()}
                    onChange={onCheckboxChange}
                />
            )}
            <img
                src={url}
                alt={alt}
                className={imgClassName ?? ''}
                loading={loading}
                onError={onError}
            />
        </Box>
    );
}
