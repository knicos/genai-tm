import React, { useState, useCallback } from "react";
import { Widget } from "../widget/Widget";
import { useTranslation } from "react-i18next";
import style from "./Output.module.css";
import { BehaviourType } from "../Behaviours/Behaviours";
import IconButton from '@mui/material/IconButton';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen';
import { useVariant } from "../../util/variant";
import AudioPlayer from "./AudioPlayer";
import Slider from '@mui/material/Slider';
import VolumeDown from '@mui/icons-material/VolumeDown';
import VolumeUp from '@mui/icons-material/VolumeUp';

interface Props {
    predicted: number;
    behaviours: BehaviourType[];
    focus?: boolean;
    disabled?: boolean;
    hidden?: boolean;
}

export default function Output({predicted, behaviours, ...props}: Props) {
    const [expanded, setExpanded] = useState(false);
    const [volume, setVolume] = useState(100);
    const {namespace} = useVariant();
    const {t} = useTranslation(namespace);

    const changeVolume = useCallback((event: Event, newValue: number | number[]) => {
        setVolume(newValue as number);
    }, []);

    const currentBehaviour = (predicted < behaviours.length) ? behaviours[predicted] : null;
    const hasAudio = !!currentBehaviour?.audio;
    const hasImage = !!currentBehaviour?.image;

    return <Widget dataWidget={(expanded)? "" : "output"} title={t<string>("output.labels.title")} className={(expanded) ? style.widgetExpanded : style.widget} {...props} menu={
        <IconButton aria-label="expand" size="small" onClick={() => setExpanded(!expanded)}>
            {!expanded && <OpenInFullIcon fontSize="small" />}
            {expanded && <CloseFullscreenIcon fontSize="small" />}
        </IconButton>
    }>
        <div className={style.container}>
            {behaviours.map((behaviour, ix) => <React.Fragment key={ix}>
                {behaviour?.image && <img src={behaviour.image.uri} alt="" style={{display: (ix === predicted) ? "initial" : "none"}} />}
                {behaviour?.audio && <AudioPlayer showIcon={!hasImage} volume={volume / 100} uri={behaviour.audio.uri} play={ix === predicted} />}
            </React.Fragment>)}
        </div>
        <div className={style.volumeContainer}>
            <VolumeDown />
            <Slider aria-label="Volume" value={volume} disabled={!hasAudio} onChange={changeVolume} />
            <VolumeUp />
        </div>
    </Widget>;
}