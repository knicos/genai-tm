function cropTo(image: HTMLImageElement, size: number, flipped: boolean, canvas: HTMLCanvasElement) {
    const width = image.width;
    const height = image.height;

    const min = Math.min(width, height);
    const scale = size / min;
    const scaledW = Math.ceil(width * scale);
    const scaledH = Math.ceil(height * scale);
    const dx = scaledW - size;
    const dy = scaledH - size;
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.drawImage(image, ~~(dx / 2) * -1, ~~(dy / 2) * -1, scaledW, scaledH);

        // canvas is already sized and cropped to center correctly
        if (flipped) {
            ctx.scale(-1, 1);
            ctx.drawImage(canvas, size * -1, 0);
        }
    }

    return canvas;
}

export function canvasFromFile(file: File, size = 224) {
    return new Promise<HTMLCanvasElement>((resolve, reject) => {
        const reader = new FileReader();
        reader.onabort = () => reject();
        reader.onerror = () => reject();
        reader.onload = () => {
            const newCanvas = document.createElement('canvas');
            newCanvas.width = size;
            newCanvas.height = size;
            // newCanvas.style.width = '58px';
            const img = new Image();
            img.onload = () => {
                cropTo(img, size, false, newCanvas);
                resolve(newCanvas);
            };
            img.onerror = () => {
                resolve(newCanvas);
            };
            img.src = reader.result as string;

            // Note: Here to integration tests. "onload" is not called in jest.
            if (global?.process?.env?.NODE_ENV === 'test') img.onload(new Event('onload'));
        };
        reader.readAsDataURL(file);
    });
}

export async function canvasesFromFiles(files: File[], size = 224): Promise<HTMLCanvasElement[]> {
    const filtered = files.filter((f) => f.type.startsWith('image/'));
    if (filtered.length === 0) {
        return [];
    }
    const promises = filtered.map((file) => canvasFromFile(file));
    return Promise.all(promises);
}

export function canvasFromImage(image: HTMLImageElement, size = 224) {
    return new Promise<HTMLCanvasElement>((resolve, reject) => {
        const newCanvas = document.createElement('canvas');
        newCanvas.width = size;
        newCanvas.height = size;
        image.onload = () => {
            cropTo(image, size, false, newCanvas);
            resolve(newCanvas);
        };
        image.onerror = reject;
        image.onabort = reject;
    });
}

export function canvasFromURL(url: string, size = 224) {
    return new Promise<HTMLCanvasElement>((resolve, reject) => {
        const newCanvas = document.createElement('canvas');
        newCanvas.width = size;
        newCanvas.height = size;
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.onload = () => {
            cropTo(image, size, false, newCanvas);
            resolve(newCanvas);
        };
        image.onerror = reject;
        image.onabort = reject;
        image.src = url;
    });
}

export async function canvasFromDataTransfer(item: any, size = 224): Promise<HTMLCanvasElement[]> {
    if (item?.files?.length > 0) {
        const files = item.files as File[];
        const filtered = files.filter((f) => f.type.startsWith('image/'));
        if (filtered.length === 0) {
            return [];
        }
        const promises = filtered.map((file) => canvasFromFile(file), size);
        return Promise.all(promises);
    }

    if (item?.html) {
        const root = document.createElement('html');
        root.innerHTML = item.html;
        const imgElements = root.getElementsByTagName('img');
        if (imgElements.length > 0) {
            const canv = Array.from(imgElements).map((img) => {
                img.crossOrigin = 'anonymous';
                return canvasFromImage(img, size);
            });
            return Promise.all(canv);
        }
    }

    const types = item.dataTransfer?.types as string[];
    if (types && types.includes('text/uri-list')) {
        const urlList = item.dataTransfer.getData('text/uri-list') as string;
        if (urlList.length > 0) {
            const urls = urlList.split('\n');
            const canv = urls.map((url) => canvasFromURL(url), size);
            return Promise.all(canv);
        }
    }

    return [];
}
