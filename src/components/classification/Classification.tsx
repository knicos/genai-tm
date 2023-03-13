import React from "react";
import style from "./classification.module.css";
import { IClassification } from "../../state";
import { Button } from "../button/Button";
import { Widget } from "../widget/Widget";
import Sample from "./Sample";
import WebcamCapture from "./WebcamCapture";
import VideocamIcon from '@mui/icons-material/Videocam';
import ClassMenu from "./ClassMenu";

interface Props {
    name: string;
    active: boolean;
    onActivate?: () => void;
    onDelete: () => void;
    data: IClassification;
    setData: (data: IClassification) => void;
    setActive: (active: boolean) => void;
}

export function Classification({name, active, data, setData, onActivate, setActive, onDelete}: Props) {
    return <Widget title={name} setTitle={(title: string) => {
        setData({
            label: title,
            samples: data.samples,
        });
    }} menu={<ClassMenu hasSamples={data.samples.length > 0} onDeleteClass={onDelete} onRemoveSamples={() => {
        setData({label: data.label, samples: []});
    }} />}>
        <div className={(active) ? style.containerLarge : style.containerSmall}>
            {(active) ? <WebcamCapture visible={true} onCapture={(image) => {
                image.style.width = "58px";

                setData({
                    label: name,
                    samples: [...data.samples, image],
                });
            }} onClose={() => setActive(false)}/> : null}
            <div className={style.listContainer}>
                {data.samples.length === 0 && <div className={style.samplesLabel}>Add image samples:</div>}
                {data.samples.length > 0 && <div className={style.samplesLabel}>{`${data.samples.length} image samples:`}</div>}
                <ol className={(active) ? style.samplelistLarge : style.samplelistSmall}>
                    {!active && <li className={style.sample}>
                        <Button sx={{"& .MuiButton-startIcon": { margin: "0px"}, flexDirection: "column"}} variant="outlined" startIcon={<VideocamIcon />} onClick={onActivate}>Webcam</Button>
                    </li>}
                    {data.samples.map((s, ix) => <Sample key={ix} image={s} />)}
                </ol>
            </div>
        </div>
    </Widget>;
}