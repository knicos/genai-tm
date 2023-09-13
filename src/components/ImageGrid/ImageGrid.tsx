import React from 'react';
import style from './style.module.css';
import Sample, { SampleState } from './Sample';

interface Props {
    samples: SampleState[];
    onDelete: (index: number) => void;
}

export default function ImageGrid({ samples, onDelete }: Props) {
    return (
        <div className={style.scroller}>
            <div className={style.sampleList}>
                {samples.map((s, ix) => (
                    <Sample
                        key={samples.length - ix}
                        image={s.data}
                        index={ix}
                        onDelete={onDelete}
                        status={s.state}
                    />
                ))}
            </div>
        </div>
    );
}
