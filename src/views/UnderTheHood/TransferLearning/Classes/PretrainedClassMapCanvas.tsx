import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties, PointerEvent } from 'react';
import style from './PretrainedClassMap.module.css';
import type { ClassMapItem, ClassMapLayout } from './PretrainedClassMap';
import {
    clamp,
    type ClassMapCanvasColors,
    formatPercent,
    getClassMapCanvasColors,
    GRID_GAP,
} from './PretrainedClassMap.utils';
import {
    type ClassMapCanvasView,
    drawPretrainedClassMap,
    subscribeToThumbnailUpdates,
} from './PretrainedClassMapCanvas.renderer';

interface Props {
    items: ClassMapItem[];
    layout: ClassMapLayout;
    ariaLabel: string;
    onOpen?: (item?: ClassMapItem) => void;
    interactive?: boolean;
    selectedClassId?: number | null;
    view?: ClassMapCanvasView;
}

interface PreviewTooltip {
    item: ClassMapItem;
    anchorXRatio: number;
    anchorYRatio: number;
    left?: number;
    top?: number;
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
    const redrawFrameRef = useRef<number | null>(null);
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
            if (redrawFrameRef.current !== null) return;
            redrawFrameRef.current = window.requestAnimationFrame(() => {
                redrawFrameRef.current = null;
                setThumbnailRevision((revision) => revision + 1);
            });
        };
        const unsubscribe = subscribeToThumbnailUpdates(scheduleRedraw);
        return () => {
            unsubscribe();
            if (redrawFrameRef.current !== null) window.cancelAnimationFrame(redrawFrameRef.current);
        };
    }, [interactive]);

    useLayoutEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || layout.width <= 0 || layout.height <= 0) return;

        const draw = () => {
            const colors = colorsRef.current || getClassMapCanvasColors(canvas);
            colorsRef.current = colors;
            drawPretrainedClassMap(canvas, { items, layout, interactive, selectedClassId, view, colors });
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
