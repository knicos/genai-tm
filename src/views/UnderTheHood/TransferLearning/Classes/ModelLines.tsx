import style from './ModelLines.module.css';

const FIXED_WIDTH = 72;
const FIXED_END_X = 72;
const ORIGIN_X = 30;
const START_Y = 0;
const CURVE = 14;

interface Props {
    rowCenters: number[];
    height: number;
    branchStartX?: number;
    branchBendX?: number;
}

export default function ModelLines({ rowCenters, height, branchStartX = ORIGIN_X, branchBendX = 46 }: Props) {
    return (
        <div style={{ width: '100%', height, position: 'relative' }}>
            <svg
                className={style.linesSVG}
                xmlns="http://www.w3.org/2000/svg"
                width="100%"
                height="100%"
                viewBox={`0 0 ${FIXED_WIDTH} ${Math.max(height, 1)}`}
                preserveAspectRatio="none"
            >
                {rowCenters.map((y, index) => {
                    return (
                        <path
                            key={index}
                            d={`M ${branchStartX} ${START_Y} C ${branchStartX} ${
                                y - CURVE
                            }, ${branchBendX} ${y}, ${FIXED_END_X} ${y}`}
                            fill="none"
                            stroke="white"
                            strokeWidth="5"
                        />
                    );
                })}
            </svg>
        </div>
    );
}
