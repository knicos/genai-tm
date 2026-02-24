import { DatasetImage } from './datasets';
import { canvasFromURL } from '@genai-fi/base';

export interface LoadProgress {
    loaded: number;
    total: number;
}

export async function loadDatasetImages(
    images: DatasetImage[],
    onProgress?: (progress: LoadProgress) => void
): Promise<HTMLCanvasElement[]> {
    const canvases: HTMLCanvasElement[] = [];
    
    for (let i = 0; i < images.length; i++) {
        try {
            const canvas = await canvasFromURL(images[i].url);
            canvases.push(canvas);
            
            if (onProgress) {
                onProgress({ loaded: i + 1, total: images.length });
            }
        } catch (error) {
            console.error(`Failed to load image ${i}:`, error);
            // Continue loading other images even if one fails
        }
    }
    
    return canvases;
}

export async function loadDatasetImagesInParallel(
    images: DatasetImage[],
    onProgress?: (progress: LoadProgress) => void
): Promise<HTMLCanvasElement[]> {
    let loaded = 0;
    
    const promises = images.map(async (image) => {
        try {
            const canvas = await canvasFromURL(image.url);
            loaded++;
            if (onProgress) {
                onProgress({ loaded, total: images.length });
            }
            return canvas;
        } catch (error) {
            console.error('Failed to load image:', error);
            loaded++;
            if (onProgress) {
                onProgress({ loaded, total: images.length });
            }
            return null;
        }
    });
    
    const results = await Promise.all(promises);
    return results.filter((canvas): canvas is HTMLCanvasElement => canvas !== null);
}
