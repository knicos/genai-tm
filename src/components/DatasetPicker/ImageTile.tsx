import React, { useRef, useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import styles from './DatasetPicker.module.css';
import { useScrollRoot } from './ScrollRootContext';

interface ImageTileProps {
    url: string;
    alt?: string;
    imgClassName?: string;
    selected?: boolean;
    showCheckbox?: boolean;
    checked?: boolean;
    onCheckboxChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onClick?: () => void;
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
    onError,
    hasFailed,
    containerSelected = false,
}: ImageTileProps) {
    const scrollRoot = useScrollRoot();
    const imgRef = useRef<HTMLImageElement>(null);
    // Start with no src — only set it once the tile scrolls into the dialog viewport.
    const [lazySrc, setLazySrc] = useState<string | undefined>(undefined);

    useEffect(() => {
        const el = imgRef.current;
        if (!el) return;

        // If no scroll root context is available, load immediately.
        if (!scrollRoot) {
            setLazySrc(url);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setLazySrc(url);
                    observer.disconnect();
                }
            },
            {
                root: scrollRoot,
                // Pre-load images 100px before they enter the scroll container.
                rootMargin: '100px',
            }
        );

        observer.observe(el);
        return () => observer.disconnect();
        // Re-observe if url or the scroll container changes.
    }, [url, scrollRoot]);

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
                ref={imgRef}
                src={lazySrc}
                alt={alt}
                className={imgClassName ?? ''}
                onError={onError}
                data-testid="dataset-image"
            />
        </Box>
    );
}
