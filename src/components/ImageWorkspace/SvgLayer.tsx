import React from 'react';
import style from './TeachableMachine.module.css';

export interface ILine {
    x1: number;
    x2: number;
    y1: number;
    y2: number;
    direction: 'horizontal' | 'vertical';
}

interface Props {
    lines: ILine[];
}

const CURVE = 20;

export default function SvgLayer({ lines }: Props) {
    return (
        <svg
            className={style.svglayer}
            xmlns="http://www.w3.org/2000/svg"
            width="100%"
            height="100%"
        >
            {lines.map((line, ix) => {
                const dx = line.direction === 'horizontal' ? CURVE : 0;
                const dy = line.direction === 'vertical' ? CURVE : 0;
                return (
                    <path
                        key={ix}
                        d={`M ${line.x1} ${line.y1} C ${line.x1 + dx} ${line.y1 + dy}, ${line.x2 - dx} ${
                            line.y2 - dy
                        }, ${line.x2} ${line.y2}`}
                        fill="none"
                        stroke="#bdc1c6"
                        strokeWidth="2"
                    />
                );
            })}
        </svg>
    );
}
