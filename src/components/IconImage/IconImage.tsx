import React, { useEffect, useRef } from 'react';
import style from './IconImage.module.css';

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    src: string | HTMLCanvasElement;
    onDelete?: () => void;
}

export default function IconImage({ src, onDelete, ...props }: Props) {
    const ref = useRef<HTMLDivElement>(null);

    const isUrl = typeof src === 'string';

    useEffect(() => {
        if (!isUrl && ref.current) {
            while (ref.current.firstChild) {
                ref.current.removeChild(ref.current.firstChild);
            }
            ref.current.appendChild(src);
        }
    }, [src, isUrl]);

    return (
        <div
            className={style.container}
            {...props}
        >
            {isUrl ? (
                <img
                    data-testid="icon-image"
                    src={src}
                    alt=""
                />
            ) : (
                <div ref={ref} />
            )}
        </div>
    );
}
