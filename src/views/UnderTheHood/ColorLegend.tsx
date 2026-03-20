import { useEffect, useRef } from 'react';
import style from './ColorLegend.module.css';
import { useTranslation } from 'react-i18next';
import { useVariant } from '@genaitm/util/variant';

interface ColorLegendProps {
    height?: number;
    width?: number;
}

export function ColorLegend({ height = 224, width = 10 }: ColorLegendProps) {
    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Create gradient from high activation (red) to low activation (blue)
        const gradient = ctx.createLinearGradient(0, 0, 0, height);

        // HSL color mapping: reversed so red is at top
        // Saturation 70% and lightness 50% for balanced visibility
        // value = 0 (top) -> hue = 0 (red - high)
        // value = 1 (bottom) -> hue = 240 (blue - low)
        for (let i = 0; i <= 100; i++) {
            const value = i / 100;
            const hue = value * 240;
            gradient.addColorStop(i / 100, `hsl(${hue}, 70%, 50%)`);
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
    }, [height, width]);

    return (
        <div className={style.legendContainer}>
            <div className={style.legendLabel}>{t('heatmap.high')}</div>
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                className={style.legendCanvas}
            />
            <div className={style.legendLabel}>{t('heatmap.low')}</div>
        </div>
    );
}
