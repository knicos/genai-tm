import type { ClassMapItem, ClassMapLayout, PanPosition } from './PretrainedClassMap';
import {
    type ClassMapCanvasColors,
    getDevicePixelAlignedAxisCells,
    getProbabilityEmphasis,
    GRID_GAP,
    mixClassMapColor,
} from './PretrainedClassMap.utils';

export interface ClassMapCanvasView {
    zoom: number;
    pan: PanPosition;
}

interface DrawClassMapOptions {
    items: ClassMapItem[];
    layout: ClassMapLayout;
    interactive: boolean;
    selectedClassId: number | null;
    view?: ClassMapCanvasView;
    colors: ClassMapCanvasColors;
}

type ThumbnailState = 'loading' | 'loaded' | 'failed';

interface ThumbnailRecord {
    image: HTMLImageElement;
    state: ThumbnailState;
}

const MAX_DEVICE_PIXEL_RATIO = 2;
const thumbnails = new Map<string, ThumbnailRecord>();
const thumbnailSubscribers = new Set<() => void>();

function notifyThumbnailSubscribers() {
    thumbnailSubscribers.forEach((subscriber) => subscriber());
}

function requestThumbnail(imageUrl: string) {
    if (!imageUrl || thumbnails.has(imageUrl) || typeof Image === 'undefined') return;

    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.decoding = 'async';
    const record: ThumbnailRecord = { image, state: 'loading' };
    thumbnails.set(imageUrl, record);
    image.onload = () => {
        record.state = image.naturalWidth > 0 ? 'loaded' : 'failed';
        notifyThumbnailSubscribers();
    };
    image.onerror = () => {
        record.state = 'failed';
        notifyThumbnailSubscribers();
    };
    image.src = imageUrl;
}

function drawViewerCellContrast(
    context: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    emphasis: number,
    hasThumbnail: boolean,
    colors: ClassMapCanvasColors
) {
    if (!hasThumbnail) {
        context.fillStyle = mixClassMapColor(emphasis * 0.42, colors.accent);
        context.fillRect(x, y, width, height);
        return;
    }

    context.save();
    context.globalAlpha = 0.84 * (1 - emphasis);
    context.fillStyle = colors.surface;
    context.fillRect(x, y, width, height);
    context.globalAlpha = 0.18 * emphasis;
    context.fillStyle = colors.accentCss;
    context.fillRect(x, y, width, height);
    context.restore();
}

export function subscribeToThumbnailUpdates(subscriber: () => void) {
    thumbnailSubscribers.add(subscriber);
    return () => thumbnailSubscribers.delete(subscriber);
}

export function drawPretrainedClassMap(canvas: HTMLCanvasElement, options: DrawClassMapOptions) {
    const { items, layout, interactive, selectedClassId, view, colors } = options;
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

    const scale = interactive ? view?.zoom || 1 : cssWidth / layout.width;
    const offsetX = interactive ? view?.pan.x || 0 : 0;
    const offsetY = interactive ? view?.pan.y || 0 : 0;
    const cellSize = (layout.width - GRID_GAP * (layout.columns - 1)) / layout.columns;
    const scaledCellSize = cellSize * scale;
    const scaledStride = (cellSize + GRID_GAP) * scale;
    const columnGeometry = getDevicePixelAlignedAxisCells(
        layout.columns,
        offsetX,
        scaledStride,
        scaledCellSize,
        pixelRatio
    );
    const rowGeometry = getDevicePixelAlignedAxisCells(
        layout.rows,
        offsetY,
        scaledStride,
        scaledCellSize,
        pixelRatio
    );

    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    context.fillStyle = colors.surface;
    context.fillRect(0, 0, cssWidth, cssHeight);

    for (const item of items) {
        const column = columnGeometry[item.gridColumn];
        const row = rowGeometry[item.gridRow];
        if (!column || !row) continue;

        const x = column.start;
        const y = row.start;
        const cellWidth = column.size;
        const cellHeight = row.size;
        if (interactive && (column.end < 0 || row.end < 0 || x > cssWidth || y > cssHeight)) continue;

        const emphasis = getProbabilityEmphasis(item.probability);
        const thumbnail = thumbnails.get(item.imageUrls[0]);
        if (interactive) {
            if (!thumbnail) requestThumbnail(item.imageUrls[0]);
            if (thumbnail?.state === 'loaded') {
                context.drawImage(thumbnail.image, x, y, cellWidth, cellHeight);
            }
            drawViewerCellContrast(
                context,
                x,
                y,
                cellWidth,
                cellHeight,
                emphasis,
                thumbnail?.state === 'loaded',
                colors
            );
        } else {
            context.fillStyle = mixClassMapColor(emphasis, colors.accent);
            context.fillRect(x, y, cellWidth, cellHeight);
        }

        if (item.probability >= 0.01) {
            context.lineWidth = item.probability >= 0.05 ? 1 : 0.6;
            context.strokeStyle = item.probability >= 0.05 ? colors.accentCss : colors.significantBorder;
            context.strokeRect(
                x + context.lineWidth / 2,
                y + context.lineWidth / 2,
                cellWidth - context.lineWidth,
                cellHeight - context.lineWidth
            );
        }

        if (item.classId === selectedClassId) {
            context.lineWidth = 1.5;
            context.strokeStyle = colors.selectedBorder;
            context.strokeRect(x + 0.75, y + 0.75, cellWidth - 1.5, cellHeight - 1.5);
        }
    }
}
