import { FormControlLabel, Switch, Tooltip, IconButton } from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useTranslation } from 'react-i18next';
import { useVariant } from '@genaitm/util/variant';
import style from './UnderTheHood.module.css';
import { ColorLegend } from './ColorLegend';

interface HeatmapPanelProps {
    enabled: boolean;
    canPredict: boolean;
    onToggle: (checked: boolean) => void;
    canvasRef: React.RefCallback<HTMLCanvasElement>;
    size?: number;
    poseDetected?: boolean | null;
}

export function HeatmapPanel({
    enabled,
    canPredict,
    onToggle,
    canvasRef,
    size = 224,
    poseDetected,
}: HeatmapPanelProps) {
    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);

    return (
        <div className={style.heatmapSection}>
            <div className={style.heatmapLabel}>{t('heatmap.title')}</div>
            <FormControlLabel
                control={
                    <Switch
                        checked={enabled}
                        onChange={(_, checked) => onToggle(checked)}
                        color="error"
                        disabled={!canPredict}
                    />
                }
                label={enabled ? t('underTheHood.on') : t('underTheHood.off')}
            />
            {enabled && canPredict && (
                <div className={style.canvasContainer}>
                    <div className={style.canvasWrapper}>
                        <canvas
                            width={size}
                            height={size}
                            ref={canvasRef}
                            className={style.canvas}
                        />
                        {poseDetected === false && (
                            <div className={style.noPoseOverlay}>
                                <div className={style.noPoseWarning}>
                                    <WarningAmberIcon
                                        fontSize="small"
                                        className={style.noPoseWarningIcon}
                                    />
                                    <span>{t('heatmap.noPoseDetected')}</span>
                                </div>
                            </div>
                        )}
                        <Tooltip
                            title={t('heatmap.colorScaleHelp')}
                            placement="top"
                            arrow
                        >
                            <IconButton
                                size="small"
                                className={style.helpButton}
                            >
                                <HelpOutlineIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </div>
                    <ColorLegend
                        height={size}
                        width={10}
                    />
                </div>
            )}
        </div>
    );
}
