import { CSSProperties, PointerEvent, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import style from './PretrainedClassMap.module.css';
import type { ClassMapItem, ClassMapLayout, PanPosition } from './PretrainedClassMap';
import {
    clamp,
    type ClassMapCanvasColors,
    formatPercent,
    getClassMapCanvasColors,
    getProbabilityEmphasis,
    GRID_GAP,
    mixClassMapColor,
} from './PretrainedClassMap.utils';

interface Props {
    items: ClassMapItem[];
    layout: ClassMapLayout;
    ariaLabel: string;
    onOpen?: (item?: ClassMapItem) => void;
    interactive?: boolean;
    selectedClassId?: number | null;
    view?: {
        zoom: number;
        pan: PanPosition;
    };
}

const MAX_DEVICE_PIXEL_RATIO = 2;
const THUMBNAIL_CONCURRENCY = 16;
const THUMBNAIL_REDRAW_INTERVAL_MS = 80;

type ThumbnailState = 'loading' | 'loaded' | 'failed';

interface ThumbnailRecord {
    image: HTMLImageElement;
    state: ThumbnailState;
}

interface PreviewTooltip {
    item: ClassMapItem;
    anchorXRatio: number;
    anchorYRatio: number;
    left?: number;
    top?: number;
}

const thumbnails = new Map<string, ThumbnailRecord>();
const thumbnailQueue: string[] = [];
const thumbnailSubscribers = new Set<() => void>();
let activeThumbnailLoads = 0;

function notifyThumbnailSubscribers() {
    thumbnailSubscribers.forEach((subscriber) => subscriber());
}

function loadQueuedThumbnails() {
    while (activeThumbnailLoads < THUMBNAIL_CONCURRENCY && thumbnailQueue.length > 0) {
        const imageUrl = thumbnailQueue.shift();
        if (!imageUrl) continue;

        const record = thumbnails.get(imageUrl);
        if (!record || record.state !== 'loading') continue;

        activeThumbnailLoads += 1;
        record.image.onload = () => {
            record.state = record.image.naturalWidth > 0 ? 'loaded' : 'failed';
            activeThumbnailLoads -= 1;
            notifyThumbnailSubscribers();
            loadQueuedThumbnails();
        };
        record.image.onerror = () => {
            record.state = 'failed';
            activeThumbnailLoads -= 1;
            notifyThumbnailSubscribers();
            loadQueuedThumbnails();
        };
        record.image.src = imageUrl;
    }
}

function requestThumbnail(imageUrl: string) {
    if (!imageUrl || thumbnails.has(imageUrl) || typeof Image === 'undefined') return;

    const image = new Image();
    image.crossOrigin = 'anonymous';
    thumbnails.set(imageUrl, {
        image,
        state: 'loading',
    });
    thumbnailQueue.push(imageUrl);
    loadQueuedThumbnails();
}

function drawViewerCellContrast(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    emphasis: number,
    hasThumbnail: boolean,
    colors: ClassMapCanvasColors
) {
    if (!hasThumbnail) {
        context.fillStyle = mixClassMapColor(emphasis * 0.42, colors.accent);
        context.fillRect(x, y, size, size);
        return;
    }

    context.save();
    context.globalAlpha = 0.84 * (1 - emphasis);
    context.fillStyle = colors.surface;
    context.fillRect(x, y, size, size);
    context.globalAlpha = 0.18 * emphasis;
    context.fillStyle = colors.accentCss;
    context.fillRect(x, y, size, size);
    context.restore();
}

/**
 * The compact map is a single canvas instead of 1,000 React cells.
 * Live camera predictions can redraw one bitmap per input update without
 * triggering a DOM layout/style pass per class.
 */
export function PretrainedClassMapCanvas({
    items,
    layout,
    ariaLabel,
    onOpen,
    interactive = false,
    selectedClassId = null,
    view,
}: Props) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const colorsRef = useRef<ClassMapCanvasColors | null>(null);
    const redrawTimerRef = useRef<number | null>(null);
    const previewContainerRef = useRef<HTMLElement | null>(null);
    const setPreviewButtonRef = useCallback((element: HTMLButtonElement | null) => {
        previewContainerRef.current = element;
    }, []);
    const setPreviewDivRef = useCallback((element: HTMLDivElement | null) => {
        previewContainerRef.current = element;
    }, []);
    const previewTooltipRef = useRef<HTMLSpanElement | null>(null);
    const previewTooltipVisibleRef = useRef(false);
    const [thumbnailRevision, setThumbnailRevision] = useState(0);
    const [previewTooltip, setPreviewTooltip] = useState<PreviewTooltip | null>(null);
    const [previewSizeRevision, setPreviewSizeRevision] = useState(0);

    previewTooltipVisibleRef.current = previewTooltip !== null;

    useEffect(() => {
        if (!interactive) return;

        const scheduleRedraw = () => {
            if (redrawTimerRef.current !== null) return;
            redrawTimerRef.current = window.setTimeout(() => {
                redrawTimerRef.current = null;
                setThumbnailRevision((revision) => revision + 1);
            }, THUMBNAIL_REDRAW_INTERVAL_MS);
        };
        thumbnailSubscribers.add(scheduleRedraw);
        return () => {
            thumbnailSubscribers.delete(scheduleRedraw);
            if (redrawTimerRef.current !== null) window.clearTimeout(redrawTimerRef.current);
        };
    }, [interactive]);

    useLayoutEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || layout.width <= 0 || layout.height <= 0) return;

        const draw = () => {
            const cssWidth = canvas.clientWidth;
            const cssHeight = interactive ? canvas.clientHeight : cssWidth * (layout.height / layout.width);
            if (cssWidth <= 0 || cssHeight <= 0) return;
            const pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO);
            const width = Math.round(cssWidth * pixelRatio);
            const height = Math.round(cssHeight * pixelRatio);
            if (canvas.width !== width || canvas.height !== height) {
                canvas.width = width;
                canvas.height = height;
            }

            const context = canvas.getContext('2d');
            if (!context) return;
            context.imageSmoothingQuality = 'high';

            const colors = colorsRef.current || getClassMapCanvasColors(canvas);
            colorsRef.current = colors;

            const scale = interactive ? view?.zoom || 1 : cssWidth / layout.width;
            const offsetX = interactive ? view?.pan.x || 0 : 0;
            const offsetY = interactive ? view?.pan.y || 0 : 0;
            const cellSize = (layout.width - GRID_GAP * (layout.columns - 1)) / layout.columns;
            context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
            context.fillStyle = colors.surface;
            context.fillRect(0, 0, cssWidth, cssHeight);

            for (const item of items) {
                const emphasis = getProbabilityEmphasis(item.probability);
                const x = offsetX + item.gridColumn * (cellSize + GRID_GAP) * scale;
                const y = offsetY + item.gridRow * (cellSize + GRID_GAP) * scale;
                const size = cellSize * scale;
                if (interactive && (x + size < 0 || y + size < 0 || x > cssWidth || y > cssHeight)) continue;

                const thumbnail = thumbnails.get(item.imageUrls[0]);
                if (interactive) {
                    if (!thumbnail) requestThumbnail(item.imageUrls[0]);
                    if (thumbnail?.state === 'loaded') context.drawImage(thumbnail.image, x, y, size, size);
                    drawViewerCellContrast(context, x, y, size, emphasis, thumbnail?.state === 'loaded', colors);
                } else {
                    context.fillStyle = mixClassMapColor(emphasis, colors.accent);
                    context.fillRect(x, y, size, size);
                }

                if (item.probability >= 0.01) {
                    context.lineWidth = item.probability >= 0.05 ? 1 : 0.6;
                    context.strokeStyle = item.probability >= 0.05 ? colors.accentCss : colors.significantBorder;
                    context.strokeRect(
                        x + context.lineWidth / 2,
                        y + context.lineWidth / 2,
                        size - context.lineWidth,
                        size - context.lineWidth
                    );
                }

                if (item.classId === selectedClassId) {
                    context.lineWidth = 1.5;
                    context.strokeStyle = colors.selectedBorder;
                    context.strokeRect(x + 0.75, y + 0.75, size - 1.5, size - 1.5);
                }
            }
        };

        draw();
        if (typeof ResizeObserver === 'undefined') return;

        const observer = new ResizeObserver(() => {
            draw();
            if (!interactive && previewTooltipVisibleRef.current) {
                setPreviewSizeRevision((revision) => revision + 1);
            }
        });
        observer.observe(canvas);
        return () => observer.disconnect();
    }, [interactive, items, layout, selectedClassId, thumbnailRevision, view]);

    useLayoutEffect(() => {
        if (!previewTooltip) return;
        const container = previewContainerRef.current;
        const tooltip = previewTooltipRef.current;
        if (!container || !tooltip) return;

        const gap = 8;
        const maxLeft = Math.max(gap, container.clientWidth - tooltip.offsetWidth - gap);
        const maxTop = Math.max(gap, container.clientHeight - tooltip.offsetHeight - gap);
        const anchorX = previewTooltip.anchorXRatio * container.clientWidth;
        const anchorY = previewTooltip.anchorYRatio * container.clientHeight;
        const left = clamp(anchorX + gap, gap, maxLeft);
        const top = clamp(anchorY - tooltip.offsetHeight - gap, gap, maxTop);

        if (previewTooltip.left === left && previewTooltip.top === top) return;
        setPreviewTooltip((currentTooltip) =>
            currentTooltip?.item.classId === previewTooltip.item.classId &&
            currentTooltip.anchorXRatio === previewTooltip.anchorXRatio &&
            currentTooltip.anchorYRatio === previewTooltip.anchorYRatio
                ? { ...currentTooltip, left, top }
                : currentTooltip
        );
    }, [previewSizeRevision, previewTooltip]);

    const getItemAtClientPosition = useCallback(
        (clientX: number, clientY: number) => {
            const canvas = canvasRef.current;
            if (!canvas || layout.columns === 0) return null;

            const rect = canvas.getBoundingClientRect();
            const x = ((clientX - rect.left) / rect.width) * layout.width;
            const y = ((clientY - rect.top) / rect.height) * layout.height;
            const cellSize = (layout.width - GRID_GAP * (layout.columns - 1)) / layout.columns;
            const stride = cellSize + GRID_GAP;
            const column = Math.floor(x / stride);
            const row = Math.floor(y / stride);

            if (
                column < 0 ||
                row < 0 ||
                column >= layout.columns ||
                x - column * stride > cellSize ||
                y - row * stride > cellSize
            ) {
                return null;
            }

            return items.find((item) => item.gridColumn === column && item.gridRow === row) || null;
        },
        [items, layout]
    );

    const showPreviewTooltip = useCallback(
        (event: PointerEvent<HTMLElement>) => {
            const item = getItemAtClientPosition(event.clientX, event.clientY);
            if (!item) {
                setPreviewTooltip(null);
                return;
            }

            const rect = event.currentTarget.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return;
            setPreviewTooltip((currentTooltip) =>
                currentTooltip?.item.classId === item.classId
                    ? currentTooltip
                    : {
                          item,
                          anchorXRatio: (event.clientX - rect.left) / rect.width,
                          anchorYRatio: (event.clientY - rect.top) / rect.height,
                      }
            );
        },
        [getItemAtClientPosition]
    );

    const canvas = (
        <canvas
            ref={(element) => {
                canvasRef.current = element;
            }}
            className={interactive ? style.viewerMapCanvas : style.mapPreviewCanvas}
            width={layout.width}
            height={layout.height}
            aria-label={interactive ? ariaLabel : undefined}
        />
    );

    if (interactive) return canvas;

    const previewContents = (
        <>
            {canvas}
            {previewTooltip && (
                <span
                    ref={previewTooltipRef}
                    className={style.previewTooltip}
                    role="tooltip"
                    style={
                        {
                            left: previewTooltip.left ?? 0,
                            top: previewTooltip.top ?? 0,
                        } as CSSProperties
                    }
                >
                    <strong>{previewTooltip.item.className}</strong>
                    <span>{formatPercent(previewTooltip.item.probability)}</span>
                </span>
            )}
        </>
    );

    if (!onOpen) {
        return (
            <div
                ref={setPreviewDivRef}
                className={`${style.mapPreviewButton} ${style.mapPreviewStatic}`}
                role="img"
                aria-label={ariaLabel}
                onPointerMove={showPreviewTooltip}
                onPointerLeave={() => setPreviewTooltip(null)}
            >
                {previewContents}
            </div>
        );
    }

    return (
        <button
            type="button"
            ref={setPreviewButtonRef}
            className={style.mapPreviewButton}
            onClick={(event) => onOpen(getItemAtClientPosition(event.clientX, event.clientY) || undefined)}
            onPointerMove={showPreviewTooltip}
            onPointerLeave={() => setPreviewTooltip(null)}
            aria-label={ariaLabel}
        >
            {previewContents}
        </button>
    );
}
