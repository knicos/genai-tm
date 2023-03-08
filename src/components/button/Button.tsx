import React from "react";
import style from "./button.module.css";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function Button({children, ...rest}: Props) {
    return <button className={style.button} {...rest}>
        {children}
    </button>
}