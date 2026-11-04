import { usePretrainedClassMapViewport } from './usePretrainedClassMapViewport';
import { enableCamInput } from '../../../../state';
import { useAtom } from 'jotai';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useVariant } from '@genaitm/util/variant';
import CloseIcon from '@mui/icons-material/Close';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import datasetDialogStyles from '../../../../components/DatasetPicker/DatasetPicker.module.css';
import style from './PretrainedClassMap.module.css';
import type { ClassMapItem, ClassMapLayout } from './PretrainedClassMap';
import { PretrainedClassDetailPanel } from './PretrainedClassDetailPanel';
import { PretrainedClassMapCanvas } from './PretrainedClassMapCanvas';
import { clamp, formatPercent } from './PretrainedClassMap.utils';

interface Props {
    items: ClassMapItem[];
    layout: ClassMapLayout;
    allowViewer: boolean;
}

interface TooltipPosition {
    left: number;
    top: number;
}

export function PretrainedClassMapViewer({ items, layout, allowViewer }: Props) {
    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);
    const [inputEnabled, setInputEnabled] = useAtom(enableCamInput);
    const [viewerOpen, setViewerOpen] = useState(false);
    const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
    const pausedInputStateRef = useRef<boolean | null>(null);
    const mapSurfaceRef = useRef<HTMLDivElement | null>(null);
    const touchTooltipRef = useRef<HTMLDivElement | null>(null);
    const hoveredTooltipRef = useRef<HTMLDivElement | null>(null);
    const [touchTooltipPosition, setTouchTooltipPosition] = useState<TooltipPosition | null>(null);
    const [hoveredTooltipPosition, setHoveredTooltipPosition] = useState<TooltipPosition | null>(null);
    const strongestItem = useMemo(
        () =>
            items.reduce<ClassMapItem | null>(
                (best, item) => (!best || item.probability > best.probability ? item : best),
                null
            ),
        [items]
    );
    const selectedItem = items.find((item) => item.classId === selectedClassId) || strongestItem;
    const resumeClassifier = useCallback(() => {
        const inputWasEnabled = pausedInputStateRef.current;
        pausedInputStateRef.current = null;
        if (inputWasEnabled) setInputEnabled(true);
    }, [setInputEnabled]);
    const openViewer = useCallback(
        (item?: ClassMapItem) => {
            setSelectedClassId(item?.classId ?? strongestItem?.classId ?? null);
            pausedInputStateRef.current = inputEnabled;
            setInputEnabled(false);
            setViewerOpen(true);
        },
        [inputEnabled, setInputEnabled, strongestItem]
    );
    const selectClass = useCallback((item: ClassMapItem) => {
        setSelectedClassId(item.classId);
    }, []);
    const viewport = usePretrainedClassMapViewport({
        active: viewerOpen,
        items,
        layout,
        onSelectClass: selectClass,
    });
    const { panSurfaceRef } = viewport;
    const closeViewer = useCallback(() => {
        viewport.resetView();
        resumeClassifier();
        setViewerOpen(false);
        setSelectedClassId(null);
    }, [resumeClassifier, viewport.resetView]);

    useEffect(() => {
        if (!viewerOpen) return;
        // SidePanel closes on Escape making the class map full view close as well. This make Escape key closes the map first.
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key !== 'Escape') return;
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            closeViewer();
        };
        document.addEventListener('keydown', handleEscape, true);
        return () => document.removeEventListener('keydown', handleEscape, true);
    }, [closeViewer, viewerOpen]);

    useEffect(() => resumeClassifier, [resumeClassifier]);
    const touchTooltipItem = items.find((item) => item.classId === viewport.touchTooltip?.classId);
    const hoveredTooltipItem = items.find((item) => item.classId === viewport.hoveredClass?.classId);
    const setPanSurfaceRef = useCallback(
        (surface: HTMLDivElement | null) => {
            mapSurfaceRef.current = surface;
            panSurfaceRef(surface);
        },
        [panSurfaceRef]
    );
    const clampTooltipPosition = useCallback(
        (tooltip: HTMLDivElement, anchorX: number, anchorY: number, centered: boolean): TooltipPosition | null => {
            const surface = mapSurfaceRef.current;
            if (!surface) return null;

            const gap = 8;
            const maxLeft = Math.max(gap, surface.clientWidth - tooltip.offsetWidth - gap);
            const maxTop = Math.max(gap, surface.clientHeight - tooltip.offsetHeight - gap);
            return {
                left: clamp(centered ? anchorX - tooltip.offsetWidth / 2 : anchorX + gap, gap, maxLeft),
                top: clamp(anchorY - tooltip.offsetHeight - gap, gap, maxTop),
            };
        },
        []
    );

    useLayoutEffect(() => {
        const tooltip = touchTooltipRef.current;
        const hoveredClass = viewport.touchTooltip;
        if (!touchTooltipItem || !tooltip || !hoveredClass) {
            setTouchTooltipPosition((currentPosition) => (currentPosition ? null : currentPosition));
            return;
        }

        const nextPosition = clampTooltipPosition(
            tooltip,
            hoveredClass.left + hoveredClass.size / 2,
            hoveredClass.top,
            true
        );
        setTouchTooltipPosition((currentPosition) =>
            currentPosition?.left === nextPosition?.left && currentPosition?.top === nextPosition?.top
                ? currentPosition
                : nextPosition
        );
    }, [clampTooltipPosition, touchTooltipItem, viewport.touchTooltip]);

    useLayoutEffect(() => {
        const tooltip = hoveredTooltipRef.current;
        const hoveredClass = viewport.hoveredClass;
        if (!hoveredTooltipItem || !tooltip || !hoveredClass) {
            setHoveredTooltipPosition((currentPosition) => (currentPosition ? null : currentPosition));
            return;
        }

        const nextPosition = clampTooltipPosition(tooltip, hoveredClass.x, hoveredClass.y, false);
        setHoveredTooltipPosition((currentPosition) =>
            currentPosition?.left === nextPosition?.left && currentPosition?.top === nextPosition?.top
                ? currentPosition
                : nextPosition
        );
    }, [clampTooltipPosition, hoveredTooltipItem, viewport.hoveredClass]);

    return (
        <>
            <PretrainedClassMapCanvas
                items={items}
                layout={layout}
                ariaLabel={allowViewer ? t('charts.imagenetClassMapOpen') : t('charts.imagenetClassMapTitle')}
                onOpen={allowViewer ? openViewer : undefined}
            />

            <Dialog
                open={viewerOpen}
                onClose={closeViewer}
                scroll="paper"
                maxWidth={false}
                slotProps={{ paper: { className: style.viewer } }}
                aria-labelledby="imagenet-class-map-dialog-title"
            >
                <DialogTitle
                    id="imagenet-class-map-dialog-title"
                    component="div"
                    className={datasetDialogStyles.dialogTitle}
                >
                    <div>
                        <div>{t('charts.imagenetClassMapTitle')}</div>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                        >
                            {t('charts.imagenetClassMapCount')}
                        </Typography>
                    </div>
                    <IconButton
                        className={datasetDialogStyles.closeButton}
                        onClick={closeViewer}
                        aria-label={t('charts.imagenetClassMapClose')}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>

                <DialogContent
                    className={style.viewerBody}
                >
                    <div className={style.mapViewport}>
                        <div className={style.mapControls}>
                            <IconButton
                                className={style.darkIconButton}
                                onClick={viewport.zoomIn}
                                disabled={!viewport.canZoomIn}
                                aria-label={t('charts.imagenetClassMapZoomIn')}
                                color="inherit"
                            >
                                <ZoomInIcon />
                            </IconButton>
                            <IconButton
                                className={style.darkIconButton}
                                onClick={viewport.zoomOut}
                                disabled={!viewport.canZoomOut}
                                aria-label={t('charts.imagenetClassMapZoomOut')}
                                color="inherit"
                            >
                                <ZoomOutIcon />
                            </IconButton>
                            <IconButton
                                className={style.darkIconButton}
                                onClick={viewport.resetView}
                                aria-label={t('charts.imagenetClassMapReset')}
                                color="inherit"
                            >
                                <CenterFocusStrongIcon />
                            </IconButton>
                        </div>
                        <div
                            ref={setPanSurfaceRef}
                            className={style.panSurface}
                            onPointerDown={viewport.handlePanPointerDown}
                            onPointerMove={viewport.handlePanPointerMove}
                            onPointerLeave={viewport.handlePanPointerLeave}
                            onPointerUp={viewport.handlePanPointerUp}
                            onPointerCancel={viewport.handlePanPointerCancel}
                        >
                            <PretrainedClassMapCanvas
                                items={items}
                                layout={layout}
                                interactive
                                selectedClassId={selectedItem?.classId ?? null}
                                view={viewport.view}
                                ariaLabel={t('charts.imagenetClassMapTitle')}
                            />
                            {touchTooltipItem && (
                                <div
                                    ref={touchTooltipRef}
                                    className={style.canvasTouchTooltip}
                                    role="status"
                                    style={{
                                        left:
                                            touchTooltipPosition?.left ??
                                            (viewport.touchTooltip
                                                ? viewport.touchTooltip.left + viewport.touchTooltip.size / 2
                                                : 0),
                                        top: touchTooltipPosition?.top ?? viewport.touchTooltip?.top ?? 0,
                                    }}
                                >
                                    <strong>{touchTooltipItem.className}</strong>
                                    <span>{formatPercent(touchTooltipItem.probability)}</span>
                                </div>
                            )}
                            {!touchTooltipItem && hoveredTooltipItem && viewport.hoveredClass && (
                                <>
                                    <div
                                        className={style.hoveredCellOutline}
                                        aria-hidden="true"
                                        style={{
                                            left: viewport.hoveredClass.left,
                                            top: viewport.hoveredClass.top,
                                            width: viewport.hoveredClass.size,
                                            height: viewport.hoveredClass.size,
                                        }}
                                    />
                                    <div
                                        ref={hoveredTooltipRef}
                                        className={style.canvasPointerTooltip}
                                        role="tooltip"
                                        style={{
                                            left: hoveredTooltipPosition?.left ?? viewport.hoveredClass.x,
                                            top: hoveredTooltipPosition?.top ?? viewport.hoveredClass.y,
                                        }}
                                    >
                                        <strong>{hoveredTooltipItem.className}</strong>
                                        <span>{formatPercent(hoveredTooltipItem.probability)}</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {selectedItem && <PretrainedClassDetailPanel item={selectedItem} />}
                </DialogContent>
            </Dialog>
        </>
    );
}
