import React from "react";
import style from "./classification.module.css";

export function Classification({name}: {name: string}) {
    return <section className={style.classification}>
        <header>
            <h1>{name}</h1>
        </header>
    </section>;
}