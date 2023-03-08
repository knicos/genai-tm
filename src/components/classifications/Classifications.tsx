import React from "react";
import { Classification } from "../classification/Classification";
import { Button } from "../button/Button";
import { useRecoilState } from "recoil";
import { stateClassifications } from "../../state";

export function Classifications() {
    const [classes, setClasses] = useRecoilState(stateClassifications);
    return <div>
        {classes.map((c, ix) => <Classification key={ix} name={c.label} />)}
        <Button onClick={() => {
            setClasses((old) => [...old, { label: `Classification ${classes.length + 1}`, samples: []}]);
        }}>
            Add Classification
        </Button>
    </div>;
}