import React, { useState, useCallback } from "react";
import { Widget } from "../widget/Widget";
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Image, { ImageBehaviour } from "../Behaviour/Image";
import VideoCameraBackIcon from '@mui/icons-material/VideoCameraBack';
import MusicNoteIcon from '@mui/icons-material/MusicNote';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import style from "./Behaviour.module.css";

type BehaviourTypes = "image" | "sound" | "speech";

export interface BehaviourType {
    type: BehaviourTypes;
    image: ImageBehaviour;
}

interface Props {
    classLabel: string;
    behaviour: BehaviourType;
    setBehaviour: (newBehaviour: BehaviourType) => void;
    disabled?: boolean;
    hidden?: boolean;
    focus?: boolean;
}

export default function Behaviour({classLabel, behaviour, setBehaviour, ...props}: Props) {
    const [value, setValue] = useState<BehaviourTypes>("image");

    const handleChange = useCallback((
            event: React.MouseEvent<HTMLElement>,
            newType: BehaviourTypes | null,
        ) => {
            if (newType !== null) setValue(newType);
        }, [setValue]);

    const doSetBehaviour = useCallback((image: ImageBehaviour) => {
        setBehaviour({...behaviour, image});
    }, [setBehaviour, behaviour]);

    return <Widget dataWidget="behaviour" title={classLabel} className={style.widget} {...props}>
        <div className={style.container}>
            <ToggleButtonGroup
                value={value}
                onChange={handleChange}
                exclusive
                color="primary"
                fullWidth
                size="small"
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
                {value === "image" && <Image
                    behaviour={behaviour.image}
                    setBehaviour={doSetBehaviour}
                    />}
        </div>
    </Widget>
}
