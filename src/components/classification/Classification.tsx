import React, { useRef } from "react";
import { useSetRecoilState } from "recoil";
import { Webcam } from "../webcam/Webcam";
import style from "./classification.module.css";
import { stateClassifications } from "../../state";
import { Button } from "../button/Button";

interface Props {
    index: number;
    name: string;
    active: boolean;
    onActivate?: () => void;
}

export function Classification({index, name, active, onActivate}: Props) {
    const setClasses = useSetRecoilState(stateClassifications)
    const imageListRef = useRef<HTMLDivElement>(null);

    return <section className={style.classification}>
        <header>
            <h1>{name}</h1>
        </header>
        {(active) ? <Webcam capture={true} interval={10000} onCapture={(image) => {
            image.style.width = "58px";
            imageListRef.current?.appendChild(image);

            setClasses((old) => {
                const newClasses = [...old];
                newClasses[index] = {
                    label: name,
                    samples: [...old[index].samples, image],
                }
                return newClasses;
            });
        }} /> : null}
        <div ref={imageListRef} />
        {!active && <Button onClick={onActivate}>Select</Button>}
    </section>;
}