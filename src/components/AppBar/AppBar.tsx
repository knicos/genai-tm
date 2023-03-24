import React from "react";
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import { useTranslation } from "react-i18next";
import { useVariant } from "../../util/variant";
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import style from "./AppBar.module.css";

interface Props {
    onSave: () => void;
}

export default function ApplicationBar({onSave}: Props) {
    const {namespace} = useVariant();
    const {t} = useTranslation(namespace);
    return <AppBar component="nav" className="AppBar" position="static">
        <Toolbar>
            <h1>
                {t("app.title")}
            </h1>
            <div className={style.buttonBar}>
                <Button color="inherit" variant="outlined" startIcon={<SaveAltIcon />} onClick={onSave}>
                    {t("app.save")}
                </Button>
            </div>
            <Button color="inherit">{t("app.about")}</Button>
        </Toolbar>
    </AppBar>;
}