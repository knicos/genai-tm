import React, { useState, useCallback, FormEvent } from 'react';
import { IVariantContext } from '../../util/variant';
import {
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    SelectChangeEvent,
    Checkbox,
    FormControlLabel,
} from '@mui/material';
import style from './GenerateCustom.module.css';
import { Button } from '../../components/button/Button';
import { compressToEncodedURIComponent } from 'lz-string';
import { useNavigate } from 'react-router-dom';
import _settings from '../ImageGeneral/settings.json';

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

export default function GenerateCustom() {
    const navigate = useNavigate();
    const [state, setState] = useState<IVariantContext>(DEFAULTS);

    const doSubmit = useCallback(
        (event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const urlCode = compressToEncodedURIComponent(JSON.stringify(delta(state)));
            navigate(`/image/general?c=${urlCode}`);
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

    return (
        <div className={style.container}>
            <h1>Custom Image Classifier</h1>
            <form onSubmit={doSubmit}>
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
                            checked={state.speechBehaviours}
                            name="speechBehaviours"
                            onChange={doCheckChange}
                        />
                    }
                    label="Speech behaviours"
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
                <Button
                    variant="contained"
                    type="submit"
                >
                    Generate
                </Button>
            </form>
        </div>
    );
}
