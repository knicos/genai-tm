import React, { useState, useEffect } from "react";
import { Classification } from "../classification/Classification";
import { Button } from "../button/Button";
import { IClassification } from "../../state";
import style from "./trainingdata.module.css";
import AddBoxIcon from '@mui/icons-material/AddBox';
import { useTranslation } from 'react-i18next';

interface Props {
    active?: boolean;
    data: IClassification[];
    setData: (data: IClassification[]) => void;
    disabled?: boolean;
}

export function TrainingData({active, data, setData, disabled}: Props) {
    const {t} = useTranslation();
    const [activeIndex, setActiveIndex] = useState(-1);

    useEffect(() => {
        if (disabled) setActiveIndex(-1);
    }, [disabled]);

    return <div className={(disabled) ? style.containerDisabled : style.trainingcontainer}>
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
            setData([...data, { label: `${t("trainingdata.labels.class")} ${data.length + 1}`, samples: []}]);
        }}>
            {t("trainingdata.actions.addClass")}
        </Button>
    </div>;
}