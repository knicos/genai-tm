import { TeachableModel } from '@genai-fi/classifier';
import { ISample } from '@genaitm/state';

const SAMPLE_PREVIEW_DIMENSION = 58;
const SAMPLE_PREVIEW_SIZE = `${SAMPLE_PREVIEW_DIMENSION}px`;

export function createScaledPreviewCanvas(canvas: HTMLCanvasElement) {
    const preview = document.createElement('canvas');
    preview.width = SAMPLE_PREVIEW_DIMENSION;
    preview.height = SAMPLE_PREVIEW_DIMENSION;
    preview.style.width = SAMPLE_PREVIEW_SIZE;
    preview.style.height = SAMPLE_PREVIEW_SIZE;

    const ctx = preview.getContext('2d');
    if (!ctx) return undefined;

    ctx.drawImage(canvas, 0, 0, SAMPLE_PREVIEW_DIMENSION, SAMPLE_PREVIEW_DIMENSION);
    return preview;
}

export async function createModelOverlayCanvas(
    canvas: HTMLCanvasElement,
    model: TeachableModel | undefined,
    modelVariant: string,
    estimateStaticImage = true
) {
    if ((modelVariant !== 'hand' && modelVariant !== 'pose') || !model) return undefined;

    const overlay = document.createElement('canvas');
    overlay.width = canvas.width;
    overlay.height = canvas.height;

    const ctx = overlay.getContext('2d');
    if (!ctx) return undefined;

    if (estimateStaticImage) {
        await model.estimate(canvas, modelVariant === 'hand' || modelVariant === 'pose');
    }

    ctx.drawImage(canvas, 0, 0);
    model.draw(overlay);
    return overlay;
}

export async function createModelOverlayPreview(
    canvas: HTMLCanvasElement,
    model: TeachableModel | undefined,
    modelVariant: string,
    estimateStaticImage = true
) {
    const overlay = await createModelOverlayCanvas(canvas, model, modelVariant, estimateStaticImage);
    return overlay ? createScaledPreviewCanvas(overlay) : undefined;
}

export async function createModelOverlayPreviews(
    canvas: HTMLCanvasElement,
    model: TeachableModel | undefined,
    modelVariant: string,
    estimateStaticImage = true
) {
    const fullPreview = await createModelOverlayCanvas(canvas, model, modelVariant, estimateStaticImage);
    return {
        fullPreview,
        preview: fullPreview ? createScaledPreviewCanvas(fullPreview) : undefined,
    };
}

export async function createCanvasSamples(
    canvases: HTMLCanvasElement[],
    model: TeachableModel | undefined,
    modelVariant: string
): Promise<ISample[]> {
    const samples: ISample[] = [];

    for (const canvas of canvases) {
        canvas.style.width = SAMPLE_PREVIEW_SIZE;
        canvas.style.height = SAMPLE_PREVIEW_SIZE;
        const previews = await createModelOverlayPreviews(canvas, model, modelVariant);

        samples.push({
            data: canvas,
            id: '',
            ...previews,
        });
    }

    return samples;
}
