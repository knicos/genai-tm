import React, { useEffect, useState } from "react";
import { Widget } from "../widget/Widget";
import { useTranslation } from "react-i18next";
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Image, { ImageBehaviour } from "./Image";
import VideoCameraBackIcon from '@mui/icons-material/VideoCameraBack';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import style from "./Behaviours.module.css";
import { useVariant } from "../../util/variant";

type BehaviourTypes = "image" | "sound" | "speech";

export interface BehaviourType {
    type: BehaviourTypes;
    image: ImageBehaviour;
}

const defaultBehaviours: BehaviourType[] = [
    {
        type: "image",
        image: {
            uri: "https://media.giphy.com/media/nR4L10XlJcSeQ/giphy.gif",
        },
    },
    {
        type: "image",
        image: {
            uri: "https://media.giphy.com/media/fvmz3gCAip1M4/giphy.gif",
        },
    },
    {
        type: "image",
        image: {
            uri: "https://media.giphy.com/media/d1E2IByItLUuONMc/giphy.gif",
        },
    },
    {
        type: "image",
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
}

export default function Behaviours({classes, behaviours, setBehaviours, ...props}: Props) {
    const [value, setValue] = useState<BehaviourTypes>("image");

    useEffect(() => {
        if (classes.length < behaviours.length) {
            setBehaviours(behaviours.slice(0, classes.length));
        } else if (classes.length > behaviours.length) {
            setBehaviours(classes.map((c, ix) => ((ix < behaviours.length) ? behaviours[ix] : defaultBehaviours[ix % defaultBehaviours.length])));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [classes.length]);

    

    const handleChange = (
            event: React.MouseEvent<HTMLElement>,
            newType: BehaviourTypes | null,
        ) => {
            if (newType !== null) setValue(newType);
        };
    
    const {namespace} = useVariant();
    const {t} = useTranslation(namespace);
    return <Widget dataWidget="behaviours" title={t<string>("behaviours.labels.title")} className={style.widget} {...props}>
        <div className={style.container}>
            <ToggleButtonGroup
                value={value}
                onChange={handleChange}
                exclusive
                color="primary"
                fullWidth
                size="large"
                sx={{margin: "1rem 0"}}
            >
                <ToggleButton value="image">
                    <VideoCameraBackIcon />
                </ToggleButton>
                <ToggleButton value="sound" disabled>
                    <MusicNoteIcon />
                </ToggleButton>
                <ToggleButton value="speech" disabled>
                    <RecordVoiceOverIcon />
                </ToggleButton>
            </ToggleButtonGroup>
            <ol>
                {value === "image" && classes.map((c, ix) => ((behaviours.length > ix) ? <Image
                    key={ix}
                    label={c}
                    behaviour={behaviours[ix].image}
                    setBehaviour={(behaviour: ImageBehaviour) => {
                        const newBehaviours = [...behaviours];
                        newBehaviours[ix].image = behaviour;
                        setBehaviours(newBehaviours);
                    }}
                    /> : null))}
                {value === "sound" && classes.map((c, ix) => `Sound for ${c}`)}
                {value === "speech" && classes.map((c, ix) => `Speech for ${c}`)}
            </ol>
        </div>
    </Widget>
}
