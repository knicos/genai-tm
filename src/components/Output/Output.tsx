import React, { useState } from "react";
import { Widget } from "../widget/Widget";
import { useTranslation } from "react-i18next";
import style from "./Output.module.css";
import { BehaviourType } from "../Behaviours/Behaviours";
import IconButton from '@mui/material/IconButton';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import { useVariant } from "../../util/variant";

interface Props {
    predicted: number;
    behaviours: BehaviourType[];
    focus?: boolean;
    disabled?: boolean;
    hidden?: boolean;
}

export default function Output({predicted, behaviours, ...props}: Props) {
    const [expanded, setExpanded] = useState(false);
    const {namespace} = useVariant();
    const {t} = useTranslation(namespace);

    const behaviour = (predicted >= 0 && predicted < behaviours.length) ? behaviours[predicted] : null;

    return <Widget dataWidget={(expanded)? "" : "output"} title={t<string>("output.labels.title")} className={(expanded) ? style.widgetExpanded : style.widget} {...props} menu={
        <IconButton aria-label="expand" size="small" onClick={() => setExpanded(!expanded)}>
            {!expanded && <OpenInFullIcon fontSize="small" />}
            {expanded && <CloseFullscreenIcon fontSize="small" />}
        </IconButton>
    }>
        <div className={style.container}>
            {behaviour && <img src={behaviour.image.uri} alt="" />}
        </div>
    </Widget>;
}