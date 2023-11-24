import style from './PercentageBar.module.css';

export type Colours = 'purple' | 'green' | 'blue' | 'red' | 'orange';

interface Props {
    colour: Colours;
    value: number;
}

export default function PercentageBar({ colour, value }: Props) {
    const pc = Math.round(value);

    return (
        <div className={`${style.outer} ${style[colour]}`}>
            <div
                className={`${style.progress} ${style[colour]}`}
                style={{ width: `${pc}%` }}
            ></div>
            <div
                className={style.label}
                style={{ width: `${pc}%` }}
            >
                {pc}%
            </div>
        </div>
    );
}
