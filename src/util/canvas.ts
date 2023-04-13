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
