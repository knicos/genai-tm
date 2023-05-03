import React, { useState, useCallback, FormEvent } from 'react';
import { IVariantContext, useVariant, VariantContext } from '../../util/variant';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import style from './GenerateCustom.module.css';
import { Button } from '../../components/button/Button';
import { compressToEncodedURIComponent } from 'lz-string';
import { useNavigate } from 'react-router-dom';
import _settings from '../ImageGeneral/settings.json';
import { useSearchParams } from 'react-router-dom';
import { decompressFromEncodedURIComponent } from 'lz-string';
import { useTranslation } from 'react-i18next';
import { LANGS } from '../../components/AppBar/AppBar';

const DEFAULTS = _settings as IVariantContext;

function delta(data: IVariantContext): Partial<IVariantContext> {
    const result: any = {};
    const keys = Object.keys(data) as Array<keyof IVariantContext>;
    for (const k of keys) {
        if (data[k] !== DEFAULTS[k]) {
            result[k] = data[k];
        }
    }
    return result;
}

function SettingsForm() {
    const navigate = useNavigate();
    const { i18n } = useTranslation();
    const initial = useVariant();
    const [state, setState] = useState<IVariantContext>(initial);

    const doSubmit = useCallback(
        (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const str = JSON.stringify(delta(state));
            const urlCode = compressToEncodedURIComponent(str);
            navigate(str === '{}' ? '/image/general' : `/image/general?c=${urlCode}`, { replace: false });
        },
        [state, navigate]
    );

    const doCheckChange = useCallback(
        (event: FormEvent<HTMLInputElement>) => {
            setState((old) => ({ ...old, [event.currentTarget.name]: event.currentTarget.checked }));
        },
        [setState]
    );

    const doSelectChange = useCallback(
        (event: SelectChangeEvent) => {
            setState((old) => ({ ...old, [event.target.name]: event.target.value }));
        },
        [setState]
    );

    const doCancel = useCallback(() => {
        navigate(-1);
    }, [navigate]);

    const doReset = useCallback(() => {
        setState(DEFAULTS);
    }, [setState]);

    const doLanguageChange = useCallback(
        (event: SelectChangeEvent) => {
            i18n.changeLanguage(event?.target.value);
        },
        [i18n]
    );

    return (
        <div className={style.container}>
            <h1>Settings</h1>
            <form onSubmit={doSubmit}>
                <FormControl fullWidth>
                    <InputLabel id="language-select">Language</InputLabel>
                    <Select
                        labelId="language-select"
                        onChange={doLanguageChange}
                        value={i18n.language}
                        label="Language Level"
                        name="namespace"
                    >
                        {LANGS.map((lng) => (
                            <MenuItem value={lng.name}>{lng.label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl fullWidth>
                    <InputLabel id="template-select">Language Level</InputLabel>
                    <Select
                        labelId="template-select"
                        onChange={doSelectChange}
                        value={state.namespace}
                        label="Language Level"
                        name="namespace"
                    >
                        <MenuItem value="image_adv">Advanced</MenuItem>
                        <MenuItem value="image_4_9">Grade 4-9</MenuItem>
                    </Select>
                </FormControl>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={state.advancedMenu}
                            name="advancedMenu"
                            onChange={doCheckChange}
                        />
                    }
                    label="Show Advanced Training Menu"
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={state.modelSelect}
                            name="modelSelect"
                            onChange={doCheckChange}
                        />
                    }
                    label="Allow model selection"
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={state.modelThreshold}
                            name="modelThreshold"
                            onChange={doCheckChange}
                        />
                    }
                    label="Enable threshold output"
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={state.sampleUploadFile}
                            name="sampleUploadFile"
                            onChange={doCheckChange}
                        />
                    }
                    label="Enable file upload for samples"
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={state.disableAddClass}
                            name="disableAddClass"
                            onChange={doCheckChange}
                        />
                    }
                    label="Disable adding classes"
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={state.disabledClassRemove}
                            name="disabledClassRemove"
                            onChange={doCheckChange}
                        />
                    }
                    label="Disable class removal"
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={state.disableClassNameEdit}
                            name="disableClassNameEdit"
                            onChange={doCheckChange}
                        />
                    }
                    label="Disable class name editing"
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={state.imageBehaviours}
                            name="imageBehaviours"
                            onChange={doCheckChange}
                        />
                    }
                    label="Image behaviours"
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={state.soundBehaviours}
                            name="soundBehaviours"
                            onChange={doCheckChange}
                        />
                    }
                    label="Sound behaviours"
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={state.embedBehaviours}
                            name="embedBehaviours"
                            onChange={doCheckChange}
                        />
                    }
                    label="Embedding behaviours"
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={state.textBehaviours}
                            name="textBehaviours"
                            onChange={doCheckChange}
                        />
                    }
                    label="Text behaviours                  "
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={state.trainingStep}
                            name="trainingStep"
                            onChange={doCheckChange}
                        />
                    }
                    label="Include training step"
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={state.behavioursStep}
                            name="behavioursStep"
                            onChange={doCheckChange}
                        />
                    }
                    label="Include behaviors step"
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={state.multipleBehaviours}
                            name="multipleBehaviours"
                            onChange={doCheckChange}
                        />
                    }
                    label="Allow multiple behaviours"
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={state.disableSaveSamples}
                            name="disableSaveSamples"
                            onChange={doCheckChange}
                        />
                    }
                    label="Disable sample saving option"
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={state.showTrainingAnimation}
                            name="showTrainingAnimation"
                            onChange={doCheckChange}
                        />
                    }
                    label="Show Training Animation"
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={state.resetOnLoad}
                            name="resetOnLoad"
                            onChange={doCheckChange}
                        />
                    }
                    label="Hide Behaviours on Load"
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={state.enableFileInput}
                            name="enableFileInput"
                            onChange={doCheckChange}
                        />
                    }
                    label="Enable input from files"
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={state.allowDeploy}
                            name="allowDeploy"
                            onChange={doCheckChange}
                        />
                    }
                    label="Allow deployment link"
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={state.showDragTip}
                            name="showDragTip"
                            onChange={doCheckChange}
                        />
                    }
                    label="Show Drag & Drop animation tip"
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={state.usep2p}
                            name="usep2p"
                            onChange={doCheckChange}
                        />
                    }
                    label="Enable Peer-2-Peer feature"
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={state.showSettings}
                            name="showSettings"
                            onChange={doCheckChange}
                        />
                    }
                    label="Show settings"
                />
                <div className={style.buttonBar}>
                    <Button
                        variant="contained"
                        type="submit"
                    >
                        Save
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={doReset}
                    >
                        Reset
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={doCancel}
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default function GenerateCustom() {
    const [params] = useSearchParams();
    const customStr = decompressFromEncodedURIComponent(params.get('c') || '');
    const custom = (customStr ? JSON.parse(customStr) : {}) as IVariantContext;

    return (
        <VariantContext.Provider value={{ ...DEFAULTS, ...custom }}>
            <SettingsForm />
        </VariantContext.Provider>
    );
}
