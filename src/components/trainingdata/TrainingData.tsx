import React, { useState, useEffect, useCallback } from 'react';
import { Classification } from '../classification/Classification';
import { Button } from '../button/Button';
import { IClassification } from '../../state';
import style from './trainingdata.module.css';
import AddBoxIcon from '@mui/icons-material/AddBox';
import { useTranslation } from 'react-i18next';
import { useVariant } from '../../util/variant';

interface Props {
    active?: boolean;
    data: IClassification[];
    setData: (data: ((old: IClassification[]) => IClassification[]) | IClassification[]) => void;
    disabled?: boolean;
    onFocused: (f: boolean) => void;
}

export function TrainingData({ active, data, setData, disabled, onFocused }: Props) {
    const { namespace, disableAddClass } = useVariant();
    const { t } = useTranslation(namespace);
    const [activeIndex, setActiveIndex] = useState(-1);

    useEffect(() => {
        if (disabled) setActiveIndex(-1);
    }, [disabled]);

    const setDataIx = useCallback(
        (samples: (old: IClassification) => IClassification, ix: number) => {
            setData((data) => {
                const newdata = [...data];
                newdata[ix] = samples(data[ix]);
                return newdata;
            });
        },
        [setData]
    );

    const doActivate = useCallback((ix: number) => active && setActiveIndex(ix), [active, setActiveIndex]);

    const doDelete = useCallback((ix: number) => setData(data.filter((_, index) => index !== ix)), [setData, data]);

    const doSetActive = useCallback((a: boolean, ix: number) => setActiveIndex(a ? ix : -1), [setActiveIndex]);

    const doDeactivate = useCallback(
        (e: React.FocusEvent<HTMLElement>) => {
            const relTarget = e.relatedTarget;
            const curTarget = e.currentTarget;
            const doClose = () => {
                if (relTarget && !curTarget.contains(relTarget)) {
                    setActiveIndex(-1);
                } else if (!relTarget) {
                    setActiveIndex(-1);
                }
                window.removeEventListener('mouseup', doClose);
            };
            window.addEventListener('mouseup', doClose);
            onFocused(false);
        },
        [setActiveIndex, onFocused]
    );

    const addClass = useCallback(() => {
        setData([...data, { label: `${t('trainingdata.labels.class')} ${data.length + 1}`, samples: [] }]);
    }, [setData, data, t]);

    const doFocus = useCallback(() => {
        onFocused(true);
    }, [onFocused]);

    return (
        <section
            tabIndex={-1}
            data-widget="container"
            className={disabled ? style.containerDisabled : style.trainingcontainer}
            onBlur={doDeactivate}
            onFocus={doFocus}
            aria-labelledby="training-data-header"
        >
            <h1 id="training-data-header">{t('trainingdata.labels.title')}</h1>
            {data.map((c, ix) => (
                <Classification
                    onDelete={doDelete}
                    key={ix}
                    index={ix}
                    name={c.label}
                    active={ix === activeIndex}
                    data={data[ix]}
                    setData={setDataIx}
                    onActivate={doActivate}
                    setActive={doSetActive}
                />
            ))}
            {!disableAddClass && (
                <Button
                    data-testid="addClass"
                    size="large"
                    variant="outlined"
                    startIcon={<AddBoxIcon />}
                    onClick={addClass}
                >
                    {t('trainingdata.actions.addClass')}
                </Button>
            )}
        </section>
    );
}
