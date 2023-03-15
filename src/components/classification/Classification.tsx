import React, { useCallback } from "react";
import style from "./classification.module.css";
import { IClassification } from "../../state";
import { Button } from "../button/Button";
import { Widget } from "../widget/Widget";
import Sample from "./Sample";
import WebcamCapture from "./WebcamCapture";
import VideocamIcon from '@mui/icons-material/Videocam';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ClassMenu from "./ClassMenu";
import { useTranslation } from 'react-i18next';
import { useDropzone } from "react-dropzone";

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
    const {t} = useTranslation();

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const promises = acceptedFiles.map((file) => new Promise<HTMLCanvasElement>((resolve, reject) => {
            const reader = new FileReader();
            reader.onabort = () => reject();
            reader.onerror = () => reject();
            reader.onload= () => {
                const newCanvas = document.createElement("canvas");
                newCanvas.width = 224;
                newCanvas.height = 224;
                newCanvas.style.width = "58px";
                const ctx = newCanvas.getContext("2d");
                const img = new Image();
                img.onload = () => {
                    ctx?.drawImage(img, 0, 0, 224, 224);
                    resolve(newCanvas);
                }
                img.src = reader.result as string;
            }
            reader.readAsDataURL(file);
        }));

        Promise.all(promises).then((results: HTMLCanvasElement[]) => {
            setData({
                label: data.label,
                samples: [...data.samples, ...results],
            });
        });
    }, [setData, data]);

    const {getRootProps, getInputProps, isDragActive, open} = useDropzone({
        noClick: true,
        onDrop,
        accept: {
            "image/png": [".png"],
            "image/jpeg": [".jpg", ".jpeg"],
            "image/gif": [".gif"],
        },
        maxFiles: 30,
    });

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
            <div className={style.listContainer} {...getRootProps()}>
                <input {...getInputProps()} />
                {data.samples.length === 0 && <div className={style.samplesLabel}>
                    {t("trainingdata.labels.addSamples")}:
                </div>}
                {data.samples.length > 0 && <div className={style.samplesLabel}>
                    {t("trainingdata.labels.imageSamples", {count: data.samples.length})}
                </div>}
                <ol className={(active) ? style.samplelistLarge : style.samplelistSmall}>
                    {!active && <li className={style.sample}>
                        <Button variant="outlined" startIcon={<VideocamIcon />} onClick={onActivate}>
                            {t("trainingdata.actions.webcam")}
                        </Button>
                    </li>}
                    {!active && <li className={style.sample}>
                        <Button sx={{"& .MuiButton-startIcon": { margin: "0px"}, flexDirection: "column"}} variant="outlined" startIcon={<UploadFileIcon />} onClick={open}>
                            {t("trainingdata.actions.upload")}
                        </Button>
                    </li>}
                    {data.samples.map((s, ix) => <Sample key={ix} image={s} onDelete={() => {
                        setData({
                            label: name,
                            samples: data.samples.filter((ss, ixx) => ixx !== ix),
                        });
                    }} />)}
                </ol>
                {isDragActive && <div className={style.dropOverlay}>{t("trainingdata.labels.dropFiles")}</div>}
            </div>
        </div>
    </Widget>;
}