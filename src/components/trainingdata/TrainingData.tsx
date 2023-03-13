import React, { useState } from "react";
import { Classification } from "../classification/Classification";
import { Button } from "../button/Button";
import { IClassification } from "../../state";
import style from "./trainingdata.module.css";
import AddBoxIcon from '@mui/icons-material/AddBox';

interface Props {
    active?: boolean;
    data: IClassification[];
    setData: (data: IClassification[]) => void;
}

export function TrainingData({active, data, setData}: Props) {
    const [activeIndex, setActiveIndex] = useState(-1);

    return <div className={style.trainingcontainer}>
        {data.map((c, ix) => <Classification
            onDelete={() => {
                setData(data.filter((v, index) => index !== ix));
            }}
            key={ix}
            name={c.label}
            active={ix === activeIndex}
            data={data[ix]}
            setData={(samples: IClassification) => {
                const newdata = [...data];
                newdata[ix] = samples;
                setData(newdata);
            }}
            onActivate={() => active && setActiveIndex(ix)}
            setActive={(active: boolean) => setActiveIndex((active) ? ix : -1)}
            />)}
        <Button size="large" variant="outlined" startIcon={<AddBoxIcon />} onClick={() => {
            setData([...data, { label: `Class ${data.length + 1}`, samples: []}]);
        }}>
            Add a class
        </Button>
    </div>;
}