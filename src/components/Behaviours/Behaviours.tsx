import React, { useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import style from './Behaviours.module.css';
import { useVariant } from '../../util/variant';
import Behaviour, { BehaviourType } from '../Behaviour/Behaviour';

export type { BehaviourType };

interface Props {
    classes: string[];
    behaviours: BehaviourType[];
    setBehaviours: (newBehaviours: BehaviourType[]) => void;
    disabled?: boolean;
    hidden?: boolean;
    focus?: boolean;
}

export default function Behaviours({ classes, behaviours, setBehaviours, ...props }: Props) {
    useEffect(() => {
        if (classes.length < behaviours.length) {
            setBehaviours(behaviours.slice(0, classes.length));
        } else if (classes.length > behaviours.length) {
            setBehaviours(classes.map((c, ix) => (ix < behaviours.length ? behaviours[ix] : { text: { text: c } })));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [classes.length]);

    const doSetBehaviours = useCallback(
        (nb: BehaviourType, ix: number) => {
            const newBehaviours = [...behaviours];
            newBehaviours[ix] = nb;
            setBehaviours(newBehaviours);
        },
        [behaviours, setBehaviours]
    );

    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);
    return (
        <section
            data-widget="container"
            style={{ display: props.hidden ? 'none' : 'flex' }}
            className={style.container}
            aria-labelledby="behaviours-title"
        >
            <h1 id="behaviours-title">{t('behaviours.labels.title')}</h1>
            {classes.map((c, ix) =>
                ix < behaviours.length ? (
                    <Behaviour
                        data-testid={`behaviour-${c}`}
                        disabled={props.disabled}
                        focus={props.focus && ix === Math.floor(classes.length / 2 - 1)}
                        key={ix}
                        index={ix}
                        classLabel={c}
                        behaviour={behaviours[ix]}
                        setBehaviour={doSetBehaviours}
                    />
                ) : null
            )}
        </section>
    );
}
