import React, { useCallback } from "react";
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import { useTranslation } from "react-i18next";
import { useVariant } from "../../util/variant";
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import FileOpenIcon from '@mui/icons-material/FileOpen';
import style from "./AppBar.module.css";
import { useRecoilState } from "recoil";
import { useNavigate } from "react-router-dom";
import { fileData } from "../../state";

interface Props {
    onSave: () => void;
}

export default function ApplicationBar({onSave}: Props) {
    const {namespace} = useVariant();
    const {t} = useTranslation(namespace);
    const navigate = useNavigate();
    const [, setProject] = useRecoilState(fileData);

    const openFile = useCallback(() => {
        document.getElementById("openfile")?.click();
    }, []);

    const loadProject = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.currentTarget.files) {
            setProject(e.currentTarget.files[0]);
        }
        navigate("/image/general");
    }, [setProject, navigate]);

    return <AppBar component="nav" className="AppBar" position="static">
        <Toolbar>
            <h1>
                {t("app.title")}
            </h1>
            <input
                type="file"
                id="openfile"
                onChange={loadProject}
                hidden={true}
                accept=".zip,application/zip"
            />
            <div className={style.buttonBar}>
                <Button color="inherit" variant="outlined" startIcon={<FileOpenIcon />} onClick={openFile}>
                    {t("app.load")}
                </Button>
                <Button color="inherit" variant="outlined" startIcon={<SaveAltIcon />} onClick={onSave}>
                    {t("app.save")}
                </Button>
            </div>
            <Button color="inherit">{t("app.about")}</Button>
        </Toolbar>
    </AppBar>;
}