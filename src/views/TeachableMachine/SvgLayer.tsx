import React from "react";
import style from "./TeachableMachine.module.css";

export interface ILine {
    x1: number;
    x2: number;
    y1: number;
    y2: number;
};

interface Props {
    lines: ILine[];
}

const CURVE = 20;

export default function SvgLayer({lines}: Props) {
    return <svg className={style.svglayer} xmlns="http://www.w3.org/2000/svg" width="300%" height="200%">
        {lines.map((line, ix) => <path
            key={ix}
            d={`M ${line.x1} ${line.y1} C ${line.x1 + CURVE} ${line.y1}, ${line.x2 - CURVE} ${line.y2}, ${line.x2} ${line.y2}`}
            fill="none"
            stroke="#bdc1c6"
            strokeWidth="2"
        />)}
    </svg>;
}