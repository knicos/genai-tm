import React, { useState } from "react";
import { Classification } from "../classification/Classification";
import { Button } from "../button/Button";
import { useRecoilState } from "recoil";
import { stateClassifications } from "../../state";

export function Classifications() {
    const [activeIndex, setActiveIndex] = useState(-1);
    const [classes, setClasses] = useRecoilState(stateClassifications);
    return <div>
        {classes.map((c, ix) => <Classification
            index={ix}
            key={ix}
            name={c.label}
            active={ix === activeIndex}
            onActivate={() => setActiveIndex(ix)}
            />)}
        <Button onClick={() => {
            setClasses((old) => [...old, { label: `Class ${classes.length + 1}`, samples: []}]);
        }}>
            Add Classification
        </Button>
    </div>;
}