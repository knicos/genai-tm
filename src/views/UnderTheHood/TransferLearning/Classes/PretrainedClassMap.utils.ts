import { theme } from '@genai-fi/base';
import { hexToRgb, type Rgb } from '../../../../util/colour';

export const GRID_WIDTH = 980;
export const GRID_GAP = 1;
export const DETAIL_IMAGE_LIMIT = 5;
export const MIN_ZOOM = 1;
export const MAX_ZOOM = 12;
export const ZOOM_STEP = 0.35;
export const ZOOM_BUTTON_FACTOR = 1.5;
export const DRAG_THRESHOLD = 4;
export const TOUCH_DRAG_THRESHOLD = 10;
export const TOUCH_LONG_PRESS_DELAY = 500;
export const MIN_CLASS_TARGET_SIZE = 40;
export const MIN_TOUCH_CLASS_TARGET_SIZE = 56;
export const MAX_PRELOADED_IMAGE_URLS = 80;

const MIN_PROBABILITY = 0.01;
const PROBABILITY_TRANSITION = 0.3;
const LOW_EMPHASIS_START = 0.18;
const LOW_EMPHASIS_CURVE = 0.65;
const LOW_EMPHASIS_RANGE = 0.7;
const HIGH_EMPHASIS_START = 0.88;
const HIGH_EMPHASIS_RANGE = 1 - HIGH_EMPHASIS_START;
const LOW_PROBABILITY_RANGE = PROBABILITY_TRANSITION - MIN_PROBABILITY;
const HIGH_PROBABILITY_RANGE = 1 - PROBABILITY_TRANSITION;
const MIN_EMPHASIS = 0;
const MAX_EMPHASIS = 1;
const preloadedImageUrls = new Set<string>();
const baseWhite = (() => {
    const colour = hexToRgb(theme.palette.common.white);
    if (!colour) {
        throw new Error('The base theme must provide a hexadecimal white colour.');
    }

    return colour;
})();

export interface ClassMapCanvasColors {
    accent: Rgb;
    accentCss: string;
    significantBorder: string;
    selectedBorder: string;
    surface: string;
}

export function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
}

export function formatPercent(probability: number) {
    const pct = probability * 100;
    return pct === 0 ? '0%' : pct < 1 ? '< 1%' : `${pct.toFixed(0)}%`;
}

export function getProbabilityEmphasis(probability: number) {
    if (probability < MIN_PROBABILITY) return MIN_EMPHASIS;

    if (probability <= PROBABILITY_TRANSITION) {
        return clamp(
            LOW_EMPHASIS_START +
                Math.pow((probability - MIN_PROBABILITY) / LOW_PROBABILITY_RANGE, LOW_EMPHASIS_CURVE) *
                    LOW_EMPHASIS_RANGE,
            MIN_EMPHASIS,
            HIGH_EMPHASIS_START
        );
    }

    return clamp(
        HIGH_EMPHASIS_START +
            Math.sqrt((probability - PROBABILITY_TRANSITION) / HIGH_PROBABILITY_RANGE) * HIGH_EMPHASIS_RANGE,
        HIGH_EMPHASIS_START,
        MAX_EMPHASIS
    );
}

export function getClassMapCanvasColors(canvas: HTMLCanvasElement): ClassMapCanvasColors {
    const css = getComputedStyle(canvas);
    const accentCss = css.getPropertyValue('--class-map-accent').trim();
    const accent = hexToRgb(accentCss);
    if (!accent) {
        throw new Error(`Expected a resolved hexadecimal Class Map accent token, received "${accentCss}".`);
    }

    return {
        accent,
        accentCss,
        significantBorder: css.getPropertyValue('--class-map-significant-border').trim(),
        selectedBorder: css.getPropertyValue('--class-map-selected-border').trim(),
        surface: css.getPropertyValue('--class-map-surface').trim() || theme.palette.common.white,
    };
}

/** Mix the base surface colour with the resolved Class Map accent for canvas rendering. */
export function mixClassMapColor(amount: number, accent: Rgb) {
    const clampedAmount = clamp(amount, 0, 1);
    return `rgb(${Math.round(baseWhite.r + (accent.r - baseWhite.r) * clampedAmount)} ${Math.round(
        baseWhite.g + (accent.g - baseWhite.g) * clampedAmount
    )} ${Math.round(baseWhite.b + (accent.b - baseWhite.b) * clampedAmount)})`;
}

export function preloadDetailImages(imageUrls: string[]) {
    imageUrls.slice(0, DETAIL_IMAGE_LIMIT).forEach((imageUrl) => {
        if (preloadedImageUrls.has(imageUrl) || preloadedImageUrls.size >= MAX_PRELOADED_IMAGE_URLS) return;

        preloadedImageUrls.add(imageUrl);
        const image = new Image();
        image.decoding = 'async';
        image.src = imageUrl;
    });
}
