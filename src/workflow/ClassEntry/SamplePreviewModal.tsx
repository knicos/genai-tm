import { useState, useEffect, useCallback } from 'react';
import { Dialog, IconButton, Select, MenuItem, SelectChangeEvent, DialogTitle } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import DriveFileMoveIcon from '@mui/icons-material/DriveFileMove';
import { useTranslation } from 'react-i18next';
import { useVariant } from '../../util/variant';
import style from './SamplePreviewModal.module.css';
import { AudioExample } from '@genai-fi/classifier';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';

interface Props {
    open: boolean;
    onClose: () => void;
    imageUrl?: string;
    currentIndex: number;
    totalCount: number;
    classNames: string[];
    currentClassIndex: number;
    audio?: AudioExample;
    onPrevious: () => void;
    onNext: () => void;
    onClassChange: (classIndex: number) => void;
    onMoveToClass: (toClassIndex: number) => void;
    onDelete: () => void;
}

export default function SamplePreviewModal({
    open,
    onClose,
    imageUrl,
    currentIndex,
    totalCount,
    classNames,
    currentClassIndex,
    audio,
    onPrevious,
    onNext,
    onClassChange,
    onMoveToClass,
    onDelete,
}: Props) {
    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);
    const [moveToClassIndex, setMoveToClassIndex] = useState(currentClassIndex);
    const [playing, setPlaying] = useState(false);

    // Update moveToClassIndex when currentClassIndex changes
    useEffect(() => {
        setMoveToClassIndex(currentClassIndex);
    }, [currentClassIndex]);

    const handleMoveClassChange = (event: SelectChangeEvent<number>) => {
        setMoveToClassIndex(Number(event.target.value));
    };

    const handleMoveToClass = () => {
        if (moveToClassIndex !== currentClassIndex) {
            onMoveToClass(moveToClassIndex);
        }
    };

    const handlePreviousClass = () => {
        if (currentClassIndex > 0) {
            onClassChange(currentClassIndex - 1);
        }
    };

    const handleNextClass = () => {
        if (currentClassIndex < classNames.length - 1) {
            onClassChange(currentClassIndex + 1);
        }
    };

    const handleDelete = () => {
        onDelete();
        // If there are more images, stay open, otherwise close
        if (totalCount <= 1) {
            onClose();
        }
    };

    const doPlay = useCallback(async () => {
        const raw = audio?.rawAudio;
        if (!raw?.data?.length) return;

        const ctx = new AudioContext();

        if (ctx.state === 'suspended') {
            await ctx.resume();
        }

        // Recorder is mono, so 1 channel is correct
        const buffer = ctx.createBuffer(1, raw.data.length, raw.sampleRateHz);
        buffer.copyToChannel(raw.data as Float32Array<ArrayBuffer>, 0, 0);

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.onended = () => {
            //if (sourceRef.current === source) sourceRef.current = null;
            source.disconnect();
            setPlaying(false);
        };

        //sourceRef.current = source;
        source.start(0);
        setPlaying(true);
    }, [audio]);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={false}
        >
            <DialogTitle className={style.header}>
                <div className={style.classNavigation}>
                    <IconButton
                        onClick={handlePreviousClass}
                        disabled={currentClassIndex === 0}
                        size="large"
                        aria-label="previous class"
                    >
                        <KeyboardArrowUpIcon sx={{ fontSize: '1.75rem' }} />
                    </IconButton>
                    <IconButton
                        onClick={handleNextClass}
                        disabled={currentClassIndex >= classNames.length - 1}
                        size="large"
                        aria-label="next class"
                    >
                        <KeyboardArrowDownIcon sx={{ fontSize: '1.75rem' }} />
                    </IconButton>
                </div>
                <div
                    className={style.className}
                    data-testid="modal-class-name"
                >
                    {classNames[currentClassIndex]}
                </div>
                <IconButton
                    onClick={onClose}
                    aria-label="close"
                    className={style.closeButton}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <div className={style.imageContainer}>
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={`Sample ${currentIndex + 1}`}
                    />
                ) : (
                    <div
                        className={style.emptyMessage}
                        data-testid="empty-class-message"
                    >
                        {t('trainingdata.labels.emptyClass')}
                    </div>
                )}
                {audio && audio.rawAudio?.data?.length ? (
                    <IconButton
                        aria-label={t('trainingdata.aria.play')}
                        onClick={!playing ? doPlay : undefined}
                        size="large"
                        color="inherit"
                        disabled={playing}
                    >
                        {playing ? <StopIcon fontSize="inherit" /> : <PlayArrowIcon fontSize="inherit" />}
                    </IconButton>
                ) : null}
            </div>

            <div className={style.navigation}>
                <IconButton
                    onClick={onPrevious}
                    disabled={totalCount === 0 || currentIndex === 0}
                    aria-label="previous"
                    size="small"
                >
                    <ArrowBackIosNewIcon fontSize="small" />
                </IconButton>
                <div className={style.counter}>
                    {totalCount === 0 ? 'N / A' : `${currentIndex + 1} / ${totalCount}`}
                </div>
                <IconButton
                    onClick={onNext}
                    disabled={totalCount === 0 || currentIndex >= totalCount - 1}
                    aria-label="next"
                    size="small"
                >
                    <ArrowForwardIosIcon fontSize="small" />
                </IconButton>
            </div>

            <div className={style.footer}>
                <div className={style.moveToClass}>
                    <Select
                        value={moveToClassIndex}
                        onChange={handleMoveClassChange}
                        size="small"
                        className={style.moveSelect}
                        startAdornment={
                            <IconButton
                                onClick={handleMoveToClass}
                                aria-label="move to class"
                                disabled={totalCount === 0 || moveToClassIndex === currentClassIndex}
                                size="small"
                                edge="start"
                            >
                                <DriveFileMoveIcon />
                            </IconButton>
                        }
                    >
                        {classNames.map((name, index) => (
                            <MenuItem
                                key={index}
                                value={index}
                            >
                                {name}
                            </MenuItem>
                        ))}
                    </Select>
                </div>
                <IconButton
                    onClick={handleDelete}
                    aria-label={t('trainingdata.aria.delete')}
                    color="error"
                    disabled={totalCount === 0}
                >
                    <DeleteForeverIcon />
                </IconButton>
            </div>
        </Dialog>
    );
}
