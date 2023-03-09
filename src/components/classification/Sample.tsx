import React, { useRef, useEffect } from "react";
import style from "./classification.module.css";

interface Props {
    image: HTMLCanvasElement;
}

export default function Sample({image}: Props) {
    const ref = useRef<HTMLLIElement>(null);

    useEffect(() => {
        if (ref.current && image) {
            while (ref.current.firstChild) {
                ref.current.removeChild(ref.current.firstChild);
            }
            ref.current.appendChild(image);
        }
    }, [ref.current, image]);

    return <li className={style.sample} ref={ref}></li>
}