import React from "react";
import { useSetRecoilState, useRecoilValue } from "recoil";
import { stateClassifications, trainingData } from "../../state";
import { Button } from "../button/Button";

export function Trainer() {
    const setTrainingData = useSetRecoilState(trainingData);
    const classifications = useRecoilValue(stateClassifications);
    return <Button onClick={() => {
        setTrainingData(classifications);
    }}>Train</Button>
}
