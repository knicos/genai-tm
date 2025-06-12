import { useAtomValue } from 'jotai';
import style from './TeachableMachine.module.css';
import { activeNodes } from '@genaitm/state';

export interface ILine {
    x1: number;
    x2: number;
    y1: number;
    y2: number;
    direction: 'horizontal' | 'vertical';
    id1: string;
    id2: string;
}

interface Props {
    lines: ILine[];
}

const CURVE = 20;

export default function SvgLayer({ lines }: Props) {
    const activeLines = useAtomValue(activeNodes);

    return (
        <svg
            className={style.svglayer}
            xmlns="http://www.w3.org/2000/svg"
            width="100%"
            height="100%"
            aria-hidden
        >
            {lines.map((line, ix) => {
                const dx = line.direction === 'horizontal' ? CURVE : 0;
                const dy = line.direction === 'vertical' ? CURVE : 0;
                const active = activeLines.has(`${line.id1}-out`) && activeLines.has(`${line.id2}-in`);
                return (
                    <path
                        key={ix}
                        d={`M ${line.x1} ${line.y1} C ${line.x1 + dx} ${line.y1 + dy}, ${line.x2 - dx} ${
                            line.y2 - dy
                        }, ${line.x2} ${line.y2}`}
                        fill="none"
                        stroke={active ? 'rgb(174, 37, 174)' : '#7C828D'}
                        strokeWidth="2"
                        strokeDasharray={active ? undefined : '4 4'}
                    />
                );
            })}
        </svg>
    );
}
