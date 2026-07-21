import style from './PretrainedConcepts.module.css';
import chartStyle from '../Charts.module.css';
import underTheHoodStyle from '../UnderTheHood.module.css';
import ModelLines from './ModelLines';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import DeviceHubIcon from '@mui/icons-material/DeviceHub';
import { Help } from '@genai-fi/base';
import { useVariant } from '@genaitm/util/variant';
import { imageNetTop5 } from '../../../state';

interface PredictionRow {
    classId: number;
    label: string;
    value: string;
    displayValue: string;
    samples: string[];
}

function numberArrayEqual(left: number[], right: number[]) {
    if (left.length !== right.length) return false;
    for (let index = 0; index < left.length; index += 1) {
        if (left[index] !== right[index]) return false;
    }
    return true;
}

export function PretrainedConcepts() {
    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);
    const imageNetRows = useAtomValue(imageNetTop5);
    const description = t('charts.pretrainedConceptsHelp');
    const predictions: PredictionRow[] = useMemo(
        () =>
            imageNetRows.map((entry) => {
                const pct = Math.max(0, Math.min(100, entry.probability * 100));
                return {
                    classId: entry.classId,
                    label: entry.className,
                    value: pct.toFixed(0),
                    displayValue: pct === 0 ? '0%' : pct < 1 ? '< 1%' : `${pct.toFixed(0)}%`,
                    samples: entry.imageUrls.slice(0, 5),
                };
            }),
        [imageNetRows]
    );
    const [expandedLabel, setExpandedLabel] = useState<string | null>(null);
    const expandedLabelRef = useRef(expandedLabel);
    expandedLabelRef.current = expandedLabel;
    const rowsRef = useRef<HTMLDivElement>(null);
    const [rowCenters, setRowCenters] = useState<number[]>([]);
    const [linesHeight, setLinesHeight] = useState<number>(0);
    const rowButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

    useEffect(() => {
        const current = expandedLabelRef.current;
        if (!current) return;
        if (!predictions.some((row) => row.label === current)) {
            setExpandedLabel(null);
        }
    }, [predictions]);

    useEffect(() => {
        const rowsElement = rowsRef.current;
        if (!rowsElement || predictions.length === 0) {
            setRowCenters((previous) => (previous.length === 0 ? previous : []));
            setLinesHeight((previous) => (previous === 0 ? previous : 0));
            return;
        }

        const updateGeometry = () => {
            const rowsRect = rowsElement.getBoundingClientRect();
            const measuredCenters = predictions.map(({ label }) => {
                const button = rowButtonRefs.current[label];
                if (!button) {
                    return 0;
                }
                const buttonRect = button.getBoundingClientRect();
                return buttonRect.top - rowsRect.top + buttonRect.height / 2;
            });
            setRowCenters((previous) => (numberArrayEqual(previous, measuredCenters) ? previous : measuredCenters));
            const nextHeight = rowsElement.scrollHeight;
            setLinesHeight((previous) => (previous === nextHeight ? previous : nextHeight));
        };

        const observer = new ResizeObserver(updateGeometry);
        observer.observe(rowsElement);
        Object.values(rowButtonRefs.current).forEach((button) => {
            if (button) {
                observer.observe(button);
            }
        });

        updateGeometry();
        return () => {
            observer.disconnect();
        };
    }, [expandedLabel, predictions]);

    if (predictions.length === 0) {
        return null;
    }

    return (
        <section className={chartStyle.section}>
            <div className={chartStyle.titleRow}>
                <div className={`${underTheHoodStyle.heatmapLabel} ${chartStyle.title}`}>
                    {t('charts.pretrainedConceptsTitle')}
                </div>
                <Help
                    inplace
                    message={description}
                    dark
                />
            </div>

            <div className={style.pretrainedPredictionsScroller}>
                <div className={style.pretrainedScrollableContent}>
                    <div className={style.pretrainedFlow}>
                        <div className={style.pretrainedModelNode}>
                            <DeviceHubIcon fontSize="large" />
                        </div>
                        <div className={style.pretrainedModelInfo}>
                            <div className={style.pretrainedModelTitle}>{t('charts.pretrainedModelLayers')}</div>
                            <div className={style.pretrainedModelSubtitle}>{t('charts.pretrainedModelSubtitle')}</div>
                        </div>
                    </div>
                    <div className={style.pretrainedPredictionsArea}>
                        <div className={style.pretrainedModelLines}>
                            <ModelLines
                                rowCenters={rowCenters}
                                height={linesHeight}
                            />
                        </div>
                        <div
                            ref={rowsRef}
                            className={style.pretrainedRows}
                        >
                            {predictions.map((item) => (
                                <div
                                    key={item.classId}
                                    className={style.pretrainedItem}
                                >
                                    <button
                                        type="button"
                                        className={style.pretrainedHierarchyRowButton}
                                        ref={(element) => {
                                            rowButtonRefs.current[item.label] = element;
                                        }}
                                        onClick={() =>
                                            setExpandedLabel(expandedLabel === item.label ? null : item.label)
                                        }
                                    >
                                        <span className={style.pretrainedToken}>
                                            <span className={style.pretrainedTokenText}>{item.label}</span>
                                        </span>
                                        <div className={style.pretrainedBarTrack}>
                                            <div
                                                className={style.pretrainedBarFill}
                                                style={{ width: `${item.value}%` }}
                                            />
                                        </div>
                                        <span className={style.pretrainedValue}>{item.displayValue}</span>
                                        <span className={style.pretrainedExpandIcon}>
                                            {expandedLabel === item.label ? (
                                                <KeyboardArrowUpIcon />
                                            ) : (
                                                <KeyboardArrowDownIcon />
                                            )}
                                        </span>
                                    </button>

                                    {expandedLabel === item.label && (
                                        <div className={style.pretrainedSamplesRow}>
                                            {item.samples.map((sampleSrc, sampleIdx) => (
                                                <img
                                                    key={sampleSrc}
                                                    src={sampleSrc}
                                                    alt={t('charts.pretrainedSampleAlt', {
                                                        label: item.label,
                                                        index: sampleIdx + 1,
                                                    })}
                                                    loading="lazy"
                                                    decoding="async"
                                                    className={style.pretrainedSampleThumb}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
