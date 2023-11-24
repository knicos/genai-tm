import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import style from './style.module.css';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import { Button } from '../../components/button/Button';

export default function ImageVariants() {
    const { t } = useTranslation();
    const [kind, setKind] = useState('image');
    const [variant, setVariant] = useState('grade4_9');

    const doSetKind = useCallback(
        (ev: React.ChangeEvent<HTMLInputElement>) => {
            setKind(ev.target.value);
        },
        [setKind]
    );

    const doSetVariant = useCallback(
        (ev: React.ChangeEvent<HTMLInputElement>) => {
            setVariant(ev.target.value);
        },
        [setVariant]
    );

    return (
        <div className={style.container}>
            <h1>{t('app.variantTitle')}</h1>
            <FormControl>
                <FormLabel id="demo-radio-buttons-group-label">Type of data</FormLabel>
                <RadioGroup
                    row
                    aria-labelledby="demo-radio-buttons-group-label"
                    defaultValue="image"
                    name="radio-buttons-group"
                    onChange={doSetKind}
                    value={kind}
                >
                    <FormControlLabel
                        value="image"
                        control={<Radio />}
                        label="Images"
                    />
                    <FormControlLabel
                        value="pose"
                        control={<Radio />}
                        label="Body poses"
                    />
                </RadioGroup>
            </FormControl>
            <FormControl>
                <FormLabel id="age-group">Variations</FormLabel>
                <RadioGroup
                    row
                    aria-labelledby="age-group"
                    defaultValue="general"
                    name="radio-buttons-group"
                    onChange={doSetVariant}
                    value={variant}
                >
                    <FormControlLabel
                        value="general"
                        control={<Radio />}
                        label="General"
                    />
                    <FormControlLabel
                        value="grade4_9"
                        control={<Radio />}
                        label="Classroom"
                    />
                </RadioGroup>
            </FormControl>
            <Button variant="contained">Start</Button>
            <Button variant="outlined">Advanced</Button>
        </div>
    );
}
