import React, { useCallback } from "react";
import style from "./classification.module.css";
import { IClassification } from "../../state";
import { VerticalButton } from "../button/Button";
import { Widget } from "../widget/Widget";
import Sample from "./Sample";
import WebcamCapture from "./WebcamCapture";
import VideocamIcon from '@mui/icons-material/Videocam';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ClassMenu from "./ClassMenu";
import { useTranslation } from 'react-i18next';
import { useDropzone } from "react-dropzone";
import { useVariant } from "../../util/variant";

interface Props {
    name: string;
    active: boolean;
    onActivate: (ix: number) => void;
    onDelete: (ix: number) => void;
    data: IClassification;
    setData: (data: IClassification, ix: number) => void;
    setActive: (active: boolean, ix: number) => void;
    index: number;
}

export function Classification({name, active, data, index, setData, onActivate, setActive, onDelete}: Props) {
    const {namespace, sampleUploadFile, disableClassNameEdit} = useVariant();
    const {t} = useTranslation(namespace);

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
            }, index);
        });
    }, [setData, data, index]);

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

    const setTitle = useCallback((title: string) => {
        setData({
            label: title,
            samples: data.samples,
        }, index);
    }, [setData, index, data]);

    const removeSamples = useCallback(() => {
        setData({label: data.label, samples: []}, index);
    }, [data, index, setData]);

    const onCapture = useCallback((image: HTMLCanvasElement) => {
        image.style.width = "58px";

        setData({
            label: name,
            samples: [...data.samples, image],
        }, index);
    }, [setData, data, index, name]);

    const doDelete = useCallback((ix: number) => {
        setData({
            label: name,
            samples: data.samples.filter((ss, ixx) => ixx !== ix),
        }, index);
    }, [setData, name, data, index]);

    const doDeleteClass = useCallback(() => onDelete(index), [index, onDelete]);

    const doCloseWebcam = useCallback(() => setActive(false, index), [setActive, index]);

    const doActivate = useCallback(() => onActivate(index), [onActivate, index]);

    return <Widget title={name} dataWidget="class" setTitle={(disableClassNameEdit) ? undefined : setTitle} menu={<ClassMenu hasSamples={data.samples.length > 0} onDeleteClass={doDeleteClass} onRemoveSamples={removeSamples} />}>
        <div className={(active) ? style.containerLarge : style.containerSmall}>
            {(active) ? <WebcamCapture visible={true} onCapture={onCapture} onClose={doCloseWebcam}/> : null}
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
                        <VerticalButton data-testid="webcambutton" variant="outlined" startIcon={<VideocamIcon />} onClick={doActivate}>
                            {t("trainingdata.actions.webcam")}
                        </VerticalButton>
                    </li>}
                    {!active && sampleUploadFile && <li className={style.sample}>
                        <VerticalButton data-testid="uploadbutton" variant="outlined" startIcon={<UploadFileIcon />} onClick={open}>
                            {t("trainingdata.actions.upload")}
                        </VerticalButton>
                    </li>}
                    {data.samples.map((s, ix) => <Sample key={ix} index={ix} image={s} onDelete={doDelete} />)}
                </ol>
                {isDragActive && <div className={style.dropOverlay}>{t("trainingdata.labels.dropFiles")}</div>}
            </div>
        </div>
    </Widget>;
}