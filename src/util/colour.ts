export interface Rgb {
    r: number;
    g: number;
    b: number;
}

export function hexToRgb(hex: string): Rgb | null {
    const normalized = hex.replace('#', '');
    const full =
        normalized.length === 3
            ? normalized
                  .split('')
                  .map((v) => `${v}${v}`)
                  .join('')
            : normalized;

    if (!/^[\da-f]{6}$/i.test(full)) return null;

    const value = Number.parseInt(full, 16);
    return {
        r: (value >> 16) & 255,
        g: (value >> 8) & 255,
        b: value & 255,
    };
}

export function withAlpha(hex: string, alpha: number) {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

export function brightenColor(hex: string, amount = 0.2) {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;

    const mix = (channel: number) => Math.round(channel + (255 - channel) * amount);
    return `rgb(${mix(rgb.r)}, ${mix(rgb.g)}, ${mix(rgb.b)})`;
}

export function softenColor(hex: string, amount = 0.18, alpha = 0.82) {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;

    const mix = (channel: number) => Math.round(channel + (255 - channel) * amount);
    return `rgba(${mix(rgb.r)}, ${mix(rgb.g)}, ${mix(rgb.b)}, ${alpha})`;
}

export function getContrastingColour(hex: string) {
    const rgb = hexToRgb(hex);
    if (!rgb) return 'white';

    const luminance = 0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b;
    return luminance < 128 ? 'white' : 'black';
}
