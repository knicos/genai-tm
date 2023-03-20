import React from "react";
import AppBar from '@mui/material/AppBar';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import { useTranslation } from "react-i18next";
import { useVariant } from "../../util/variant";

export default function ApplicationBar() {
    const {namespace} = useVariant();
    const {t} = useTranslation(namespace);
    return <AppBar component="nav" className="AppBar" position="static">
        <Toolbar>
            <h1>
                {t("app.title")}
            </h1>
        <Button color="inherit">{t("app.about")}</Button>
        </Toolbar>
    </AppBar>;
}