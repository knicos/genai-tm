import React from "react";
import style from "./widget.module.css";

interface Props extends React.PropsWithChildren {
    title?: string;
    setTitle?: (title: string) => void;
    menu?: React.ReactNode;
}

export function Widget({title, children}: Props) {
    return <section className={style.widget}>
        {title && <header className={style.widget_header}>
            <h1 className={style.widget_title}>
                {title}
            </h1>
        </header>}
        <div className={style.widget_content}>
        {children}
        </div>
    </section>
}
