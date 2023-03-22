import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import style from "./style.module.css";

export default function ImageVariants() {
    const {t} = useTranslation();

    return <div className={style.container}>
        <h1>{t("app.variantTitle")}</h1>
        <span>{t("app.variantMessage")}</span>
        <ol>
            <li><Link to="/image/grade4_9">{t("app.variantAge4_9")}</Link></li>
            <li><Link to="/image/general">{t("app.variantAdvanced")}</Link></li>
            <li><Link to="/image/generate">{t("app.variantCustom")}</Link></li>
        </ol>
    </div>
}