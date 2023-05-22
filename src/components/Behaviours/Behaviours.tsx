import React, { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import style from './Behaviours.module.css';
import { useVariant } from '../../util/variant';
import Behaviour, { BehaviourType } from '../Behaviour/Behaviour';
import { useTeachableModel } from '../../util/TeachableModel';
import { patchBehaviours } from './patch';
import { behaviourState } from '../../state';
import { useRecoilState } from 'recoil';

export type { BehaviourType };

interface Props {
    onChange?: () => void;
    disabled?: boolean;
    hidden?: boolean;
    focus?: boolean;
}

export default function Behaviours({ onChange, ...props }: Props) {
    const [behaviours, setBehaviours] = useRecoilState(behaviourState);
    const doSetBehaviours = useCallback(
        (nb: BehaviourType, ix: number) => {
            const newBehaviours = [...behaviours];
            newBehaviours[ix] = nb;
            setBehaviours(newBehaviours);
            if (onChange) onChange();
        },
        [behaviours, setBehaviours, onChange]
    );

    const { labels } = useTeachableModel();
    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);

    useEffect(() => {
        setBehaviours((old) => patchBehaviours(old, labels || []));
    }, [labels, setBehaviours]);

    return (
        <section
            data-widget="container"
            style={{ display: props.hidden ? 'none' : 'flex' }}
            className={style.container}
            aria-labelledby="behaviours-title"
        >
            <h1 id="behaviours-title">{t('behaviours.labels.title')}</h1>
            {labels.map((c, ix) =>
                ix < behaviours.length ? (
                    <Behaviour
                        data-testid={`behaviour-${c}`}
                        disabled={props.disabled}
                        focus={props.focus && ix === Math.floor(labels.length / 2 - 1)}
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
