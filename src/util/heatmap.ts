// expected hue range: [0, 360)
// expected saturation range: [0, 1]
// expected lightness range: [0, 1]
function hslToRgb(hue: number, saturation: number, lightness: number) {
    // based on algorithm from http://en.wikipedia.org/wiki/HSL_and_HSV#Converting_to_RGB
    if (hue == undefined) {
        return [0, 0, 0];
    }

    const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
    let huePrime = hue / 60;
    const secondComponent = chroma * (1 - Math.abs((huePrime % 2) - 1));

    huePrime = Math.floor(huePrime);
    let red = 0;
    let green = 0;
    let blue = 0;

    if (huePrime === 0) {
        red = chroma;
        green = secondComponent;
        blue = 0;
    } else if (huePrime === 1) {
        red = secondComponent;
        green = chroma;
        blue = 0;
    } else if (huePrime === 2) {
        red = 0;
        green = chroma;
        blue = secondComponent;
    } else if (huePrime === 3) {
        red = 0;
        green = secondComponent;
        blue = chroma;
    } else if (huePrime === 4) {
        red = secondComponent;
        green = 0;
        blue = chroma;
    } else if (huePrime === 5) {
        red = chroma;
        green = 0;
        blue = secondComponent;
    }

    const lightnessAdjustment = lightness - chroma / 2;
    red += lightnessAdjustment;
    green += lightnessAdjustment;
    blue += lightnessAdjustment;

    return [Math.round(red * 255), Math.round(green * 255), Math.round(blue * 255)];
}

export function renderHeatmap(input: HTMLCanvasElement, output: HTMLCanvasElement, data: number[][]) {
    if (!output) return;
    const ctx = output.getContext('2d');
    if (ctx) {
        ctx.drawImage(input, 0, 0);
        const imageData = ctx.getImageData(0, 0, 224, 224);
        let ix = 0;
        for (let y = 0; y < 224; ++y) {
            for (let x = 0; x < 224; ++x) {
                const v = data[y][x];
                const [r, g, b] = hslToRgb((1 - v) * 240, 1, 0.5);
                imageData.data[ix] = 0.5 * imageData.data[ix] + 0.5 * r;
                ++ix;
                imageData.data[ix] = 0.5 * imageData.data[ix] + 0.5 * g;
                ++ix;
                imageData.data[ix] = 0.5 * imageData.data[ix] + 0.5 * b;
                ++ix;
                imageData.data[ix] = 255;
                ++ix;
            }
        }
        ctx.putImageData(imageData, 0, 0);
    }
}
