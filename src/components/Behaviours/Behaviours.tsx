import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import style from "./Behaviours.module.css";
import { useVariant } from "../../util/variant";
import Behaviour, { BehaviourType } from "../Behaviour/Behaviour";

export type { BehaviourType };

const defaultBehaviours: BehaviourType[] = [
    {
        image: {
            uri: "https://media.giphy.com/media/nR4L10XlJcSeQ/giphy.gif",
        },
    },
    {
        image: {
            uri: "https://media.giphy.com/media/fvmz3gCAip1M4/giphy.gif",
        },
    },
    {
        image: {
            uri: "https://media.giphy.com/media/d1E2IByItLUuONMc/giphy.gif",
        },
    },
    {
        image: {
            uri: "https://media.giphy.com/media/N6QMlgXmovw40/giphy.gif",
        },
    },
];

interface Props {
    classes: string[];
    behaviours: BehaviourType[];
    setBehaviours: (newBehaviours: BehaviourType[]) => void;
    disabled?: boolean;
    hidden?: boolean;
    focus?: boolean;
}

export default function Behaviours({classes, behaviours, setBehaviours, ...props}: Props) {
    useEffect(() => {
        if (classes.length < behaviours.length) {
            setBehaviours(behaviours.slice(0, classes.length));
        } else if (classes.length > behaviours.length) {
            setBehaviours(classes.map((c, ix) => ((ix < behaviours.length) ? behaviours[ix] : defaultBehaviours[ix % defaultBehaviours.length])));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [classes.length]);
    
    const {namespace} = useVariant();
    const {t} = useTranslation(namespace);
    return <section data-widget="container" style={{display: (props.hidden) ? "none" : "flex"}} className={style.container}>
        <h1>{t("behaviours.labels.title")}</h1>
        {classes.map((c, ix) => ((ix < behaviours.length) ? <Behaviour disabled={props.disabled} focus={props.focus && ix === Math.floor(classes.length / 2 - 1)} key={ix} classLabel={c} behaviour={behaviours[ix]} setBehaviour={(nb: BehaviourType) => {
            const newBehaviours = [...behaviours];
            newBehaviours[ix] = nb;
            setBehaviours(newBehaviours);    
        }} /> : null))}
    </section>
}
