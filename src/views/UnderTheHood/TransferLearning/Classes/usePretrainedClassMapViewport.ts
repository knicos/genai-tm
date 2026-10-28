import { PointerEvent, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { ClassMapItem, ClassMapLayout, PanPosition } from './PretrainedClassMap';
import {
    clamp,
    DRAG_THRESHOLD,
    GRID_GAP,
    MAX_ZOOM,
    MIN_CLASS_TARGET_SIZE,
    MIN_ZOOM,
    MIN_TOUCH_CLASS_TARGET_SIZE,
    TOUCH_LONG_PRESS_DELAY,
    TOUCH_DRAG_THRESHOLD,
    ZOOM_BUTTON_FACTOR,
    ZOOM_STEP,
} from './PretrainedClassMap.utils';

interface ViewportConfig {
    active: boolean;
    items: ClassMapItem[];
    layout: ClassMapLayout;
    onSelectClass: (item: ClassMapItem) => void;
}

interface MapView {
    zoom: number;
    pan: PanPosition;
}

interface DragStart {
    x: number;
    y: number;
    panX: number;
    panY: number;
    pointerType: string;
}

interface HoveredClass {
    classId: number;
    x: number;
    y: number;
    left: number;
    top: number;
    size: number;
}

function getClampedPan(
    pan: PanPosition,
    zoom: number,
    viewportWidth: number,
    viewportHeight: number,
    contentWidth: number,
    contentHeight: number
) {
    const scaledWidth = contentWidth * zoom;
    const scaledHeight = contentHeight * zoom;
    const clampAxis = (position: number, viewportLength: number, contentLength: number) => {
        if (viewportLength <= 0 || contentLength <= 0) return position;
        if (contentLength <= viewportLength) return (viewportLength - contentLength) / 2;

        return clamp(position, viewportLength - contentLength, 0);
    };

    return {
        x: clampAxis(pan.x, viewportWidth, scaledWidth),
        y: clampAxis(pan.y, viewportHeight, scaledHeight),
    };
}

function getFitView(
    viewportWidth: number,
    viewportHeight: number,
    contentWidth: number,
    contentHeight: number,
    minimumZoom: number
) {
    const fitZoom =
        viewportWidth > 0 && viewportHeight > 0 && contentWidth > 0 && contentHeight > 0
            ? Math.min(1, viewportWidth / contentWidth, viewportHeight / contentHeight)
            : 1;
    const zoom = clamp(Math.max(fitZoom, minimumZoom), Math.min(MIN_ZOOM, fitZoom), MAX_ZOOM);

    return {
        zoom,
        pan: getClampedPan({ x: 0, y: 0 }, zoom, viewportWidth, viewportHeight, contentWidth, contentHeight),
    };
}

function getMinimumClassZoom(layout: ClassMapLayout) {
    if (typeof window === 'undefined' || layout.columns === 0) return 0;

    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
    const minimumClassSize = isTouchDevice ? MIN_TOUCH_CLASS_TARGET_SIZE : MIN_CLASS_TARGET_SIZE;
    const baseCellSize = (layout.width - GRID_GAP * (layout.columns - 1)) / layout.columns;
    return clamp(minimumClassSize / baseCellSize, 1, MAX_ZOOM);
}

export function usePretrainedClassMapViewport({ active, items, layout, onSelectClass }: ViewportConfig) {
    const [view, setView] = useState<MapView>({ zoom: 1, pan: { x: 0, y: 0 } });
    const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
    const [touchTooltip, setTouchTooltip] = useState<HoveredClass | null>(null);
    const [hoveredClass, setHoveredClass] = useState<HoveredClass | null>(null);
    const [isPanning, setIsPanning] = useState(false);
    const panSurfaceRef = useRef<HTMLDivElement | null>(null);
    const panSurfaceWheelListenerRef = useRef<((event: WheelEvent) => void) | null>(null);
    const viewRef = useRef(view);
    const updateZoomRef = useRef<(nextZoom: number, anchor?: PanPosition) => void>(() => undefined);
    const viewFrameRef = useRef<number | null>(null);
    const dragStartRef = useRef<DragStart | null>(null);
    const dragMovedRef = useRef(false);
    const pointerDownClassIdRef = useRef<number | null>(null);
    const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const longPressTriggeredRef = useRef(false);
    const initialFitPendingRef = useRef(true);
    const minimumClassZoom = useMemo(() => getMinimumClassZoom(layout), [layout]);
    const itemByGridPosition = useMemo(
        () => new Map(items.map((item) => [`${item.gridColumn}:${item.gridRow}`, item])),
        [items]
    );

    const clearLongPress = useCallback(() => {
        if (longPressTimerRef.current !== null) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }
    }, []);

    const fitView = useMemo(
        () => getFitView(viewportSize.width, viewportSize.height, layout.width, layout.height, minimumClassZoom),
        [layout.height, layout.width, minimumClassZoom, viewportSize.height, viewportSize.width]
    );

    const scheduleViewUpdate = useCallback((nextView: MapView) => {
        viewRef.current = nextView;
        if (viewFrameRef.current !== null) return;

        if (typeof requestAnimationFrame === 'undefined') {
            setView(viewRef.current);
            return;
        }

        viewFrameRef.current = requestAnimationFrame(() => {
            viewFrameRef.current = null;
            setView(viewRef.current);
        });
    }, []);

    // Pointer moves are committed at most once per animation frame, allowing the
    // canvas to redraw at its native viewport resolution instead of CSS-scaling.
    const commitView = useCallback((nextView: MapView) => {
        viewRef.current = nextView;
        setView(nextView);
    }, []);

    useEffect(
        () => () => {
            if (viewFrameRef.current !== null) cancelAnimationFrame(viewFrameRef.current);
            clearLongPress();
        },
        [clearLongPress]
    );

    useLayoutEffect(() => {
        if (!active) return;
        const panSurface = panSurfaceRef.current;
        if (!panSurface) return;
        let resizeFrame: number | null = null;

        const updateViewportSize = () => {
            const rect = panSurface.getBoundingClientRect();
            const nextViewportSize = { width: rect.width, height: rect.height };
            setViewportSize((currentSize) =>
                currentSize.width === nextViewportSize.width && currentSize.height === nextViewportSize.height
                    ? currentSize
                    : nextViewportSize
            );

            if (rect.width === 0 || rect.height === 0) return;

            const nextFitView = getFitView(rect.width, rect.height, layout.width, layout.height, minimumClassZoom);
            const currentView = viewRef.current;
            if (initialFitPendingRef.current) {
                initialFitPendingRef.current = false;
                commitView(nextFitView);
                return;
            }

            const nextZoom = Math.max(currentView.zoom, nextFitView.zoom);
            const nextPan =
                nextZoom === nextFitView.zoom && currentView.zoom < nextFitView.zoom
                    ? nextFitView.pan
                    : getClampedPan(currentView.pan, nextZoom, rect.width, rect.height, layout.width, layout.height);

            if (nextZoom !== currentView.zoom || nextPan.x !== currentView.pan.x || nextPan.y !== currentView.pan.y) {
                commitView({ zoom: nextZoom, pan: nextPan });
            }
        };
        const scheduleViewportSizeUpdate = () => {
            if (resizeFrame !== null) return;
            if (typeof requestAnimationFrame === 'undefined') {
                updateViewportSize();
                return;
            }

            resizeFrame = requestAnimationFrame(() => {
                resizeFrame = null;
                updateViewportSize();
            });
        };

        updateViewportSize();
        if (typeof ResizeObserver === 'undefined') return;

        const observer = new ResizeObserver(scheduleViewportSizeUpdate);
        observer.observe(panSurface);
        return () => {
            observer.disconnect();
            if (resizeFrame !== null) cancelAnimationFrame(resizeFrame);
        };
    }, [active, commitView, layout.height, layout.width, minimumClassZoom]);

    const updateZoom = useCallback(
        (nextZoom: number, anchor?: PanPosition) => {
            const currentView = viewRef.current;
            const clampedZoom = clamp(nextZoom, Math.min(MIN_ZOOM, fitView.zoom), MAX_ZOOM);
            if (clampedZoom === currentView.zoom) return;

            setTouchTooltip(null);
            setHoveredClass(null);
            const panSurface = panSurfaceRef.current;
            if (!panSurface) {
                commitView({ ...currentView, zoom: clampedZoom });
                return;
            }

            const viewportAnchor = anchor || {
                x: panSurface.clientWidth / 2,
                y: panSurface.clientHeight / 2,
            };
            const worldAnchor = {
                x: (viewportAnchor.x - currentView.pan.x) / currentView.zoom,
                y: (viewportAnchor.y - currentView.pan.y) / currentView.zoom,
            };

            commitView({
                zoom: clampedZoom,
                pan: getClampedPan(
                    {
                        x: viewportAnchor.x - worldAnchor.x * clampedZoom,
                        y: viewportAnchor.y - worldAnchor.y * clampedZoom,
                    },
                    clampedZoom,
                    viewportSize.width,
                    viewportSize.height,
                    layout.width,
                    layout.height
                ),
            });
        },
        [commitView, fitView.zoom, layout.height, layout.width, viewportSize.height, viewportSize.width]
    );
    updateZoomRef.current = updateZoom;

    const resetView = useCallback(() => {
        setTouchTooltip(null);
        setHoveredClass(null);
        setIsPanning(false);
        commitView(fitView);
    }, [commitView, fitView]);

    const zoomIn = useCallback(() => {
        updateZoom(viewRef.current.zoom * ZOOM_BUTTON_FACTOR);
    }, [updateZoom]);

    const zoomOut = useCallback(() => {
        updateZoom(viewRef.current.zoom / ZOOM_BUTTON_FACTOR);
    }, [updateZoom]);

    const minimumZoom = Math.min(MIN_ZOOM, fitView.zoom);
    const canZoomIn = view.zoom < MAX_ZOOM;
    const canZoomOut = view.zoom > minimumZoom;
    const setPanSurfaceRef = useCallback((surface: HTMLDivElement | null) => {
        const previousSurface = panSurfaceRef.current;
        const previousListener = panSurfaceWheelListenerRef.current;
        if (previousSurface && previousListener) {
            previousSurface.removeEventListener('wheel', previousListener);
        }

        panSurfaceRef.current = surface;
        panSurfaceWheelListenerRef.current = null;
        if (!surface) return;

        const handleWheel = (event: WheelEvent) => {
            event.preventDefault();
            const rect = surface.getBoundingClientRect();
            updateZoomRef.current(viewRef.current.zoom + (event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP), {
                x: event.clientX - rect.left,
                y: event.clientY - rect.top,
            });
        };

        panSurfaceWheelListenerRef.current = handleWheel;
        surface.addEventListener('wheel', handleWheel, { passive: false });
    }, []);

    const getClassAtPointer = useCallback(
        (event: PointerEvent<HTMLDivElement>, currentView: MapView) => {
            const surface = panSurfaceRef.current;
            if (!surface || layout.columns === 0) return null;

            const rect = surface.getBoundingClientRect();
            const x = (event.clientX - rect.left - currentView.pan.x) / currentView.zoom;
            const y = (event.clientY - rect.top - currentView.pan.y) / currentView.zoom;
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

            return itemByGridPosition.get(`${column}:${row}`) || null;
        },
        [itemByGridPosition, layout.columns, layout.width]
    );

    const getClassPointerPosition = useCallback(
        (event: PointerEvent<HTMLDivElement>, item: ClassMapItem, currentView: MapView): HoveredClass | null => {
            const surface = panSurfaceRef.current;
            if (!surface || layout.columns === 0) return null;

            const rect = surface.getBoundingClientRect();
            const cellSize = (layout.width - GRID_GAP * (layout.columns - 1)) / layout.columns;
            const stride = cellSize + GRID_GAP;

            return {
                classId: item.classId,
                x: event.clientX - rect.left,
                y: event.clientY - rect.top,
                left: currentView.pan.x + item.gridColumn * stride * currentView.zoom,
                top: currentView.pan.y + item.gridRow * stride * currentView.zoom,
                size: cellSize * currentView.zoom,
            };
        },
        [layout.columns, layout.width]
    );

    const handlePanPointerDown = useCallback(
        (event: PointerEvent<HTMLDivElement>) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            clearLongPress();
            longPressTriggeredRef.current = false;
            dragMovedRef.current = false;
            const currentView = viewRef.current;
            const item = getClassAtPointer(event, currentView);
            pointerDownClassIdRef.current = item?.classId ?? null;
            dragStartRef.current = {
                x: event.clientX,
                y: event.clientY,
                panX: currentView.pan.x,
                panY: currentView.pan.y,
                pointerType: event.pointerType,
            };

            if (event.pointerType === 'touch' && item) {
                const tooltipPosition = getClassPointerPosition(event, item, currentView);
                longPressTimerRef.current = setTimeout(() => {
                    if (!dragMovedRef.current && pointerDownClassIdRef.current === item.classId && tooltipPosition) {
                        longPressTriggeredRef.current = true;
                        setTouchTooltip(tooltipPosition);
                    }
                }, TOUCH_LONG_PRESS_DELAY);
            }
        },
        [clearLongPress, getClassAtPointer, getClassPointerPosition]
    );

    const handlePanPointerMove = useCallback(
        (event: PointerEvent<HTMLDivElement>) => {
            const dragStart = dragStartRef.current;
            if (!dragStart) {
                if (event.pointerType !== 'touch') {
                    const currentView = viewRef.current;
                    const item = getClassAtPointer(event, currentView);
                    const nextHoveredClass = item ? getClassPointerPosition(event, item, currentView) : null;
                    setHoveredClass((currentHoveredClass) => {
                        if (!currentHoveredClass || !nextHoveredClass) return nextHoveredClass;
                        const movedEnough =
                            Math.abs(currentHoveredClass.x - nextHoveredClass.x) > 12 ||
                            Math.abs(currentHoveredClass.y - nextHoveredClass.y) > 12;
                        return currentHoveredClass.classId === nextHoveredClass.classId && !movedEnough
                            ? currentHoveredClass
                            : nextHoveredClass;
                    });
                }
                return;
            }
            const deltaX = event.clientX - dragStart.x;
            const deltaY = event.clientY - dragStart.y;
            const dragThreshold = dragStart.pointerType === 'touch' ? TOUCH_DRAG_THRESHOLD : DRAG_THRESHOLD;

            if (!dragMovedRef.current && Math.hypot(deltaX, deltaY) < dragThreshold) return;
            if (!dragMovedRef.current) {
                dragMovedRef.current = true;
                clearLongPress();
                pointerDownClassIdRef.current = null;
                setTouchTooltip(null);
                setHoveredClass(null);
                setIsPanning(true);
            }

            const currentView = viewRef.current;
            scheduleViewUpdate({
                ...currentView,
                pan: getClampedPan(
                    { x: dragStart.panX + deltaX, y: dragStart.panY + deltaY },
                    currentView.zoom,
                    viewportSize.width,
                    viewportSize.height,
                    layout.width,
                    layout.height
                ),
            });
        },
        [
            scheduleViewUpdate,
            clearLongPress,
            getClassAtPointer,
            getClassPointerPosition,
            layout.height,
            layout.width,
            viewportSize.height,
            viewportSize.width,
        ]
    );

    const handlePanPointerLeave = useCallback(() => {
        setHoveredClass(null);
    }, []);

    const selectClass = useCallback(
        (item: ClassMapItem) => {
            setTouchTooltip(null);
            setHoveredClass(null);
            onSelectClass(item);
        },
        [onSelectClass]
    );

    const handlePanPointerUp = useCallback(
        (event: PointerEvent<HTMLDivElement>) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                event.currentTarget.releasePointerCapture(event.pointerId);
            }
            clearLongPress();
            const classId = pointerDownClassIdRef.current;
            if (!longPressTriggeredRef.current && !dragMovedRef.current && classId !== null) {
                const item = items.find((classItem) => classItem.classId === classId);
                if (item) {
                    selectClass(item);
                }
            } else if (dragMovedRef.current) {
                setView(viewRef.current);
            }
            setIsPanning(false);
            dragStartRef.current = null;
            pointerDownClassIdRef.current = null;
            dragMovedRef.current = false;
            longPressTriggeredRef.current = false;
        },
        [clearLongPress, items, selectClass]
    );

    const handlePanPointerCancel = useCallback(
        (event: PointerEvent<HTMLDivElement>) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                event.currentTarget.releasePointerCapture(event.pointerId);
            }
            clearLongPress();
            setView(viewRef.current);
            setTouchTooltip(null);
            setIsPanning(false);
            dragStartRef.current = null;
            pointerDownClassIdRef.current = null;
            dragMovedRef.current = false;
            longPressTriggeredRef.current = false;
        },
        [clearLongPress]
    );

    return {
        handlePanPointerCancel,
        handlePanPointerDown,
        handlePanPointerMove,
        handlePanPointerUp,
        panSurfaceRef: setPanSurfaceRef,
        resetView,
        selectClass,
        canZoomIn,
        canZoomOut,
        handlePanPointerLeave,
        touchTooltip,
        hoveredClass,
        isPanning,
        view,
        updateZoom,
        zoomIn,
        zoomOut,
    };
}
