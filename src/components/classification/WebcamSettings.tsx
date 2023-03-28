import React from 'react';
import TextField from '@mui/material/TextField';
import style from './classification.module.css';

export interface IWebcamSettings {
    interval: number;
    count: number;
    delay: number;
}

interface Props {
    settings: IWebcamSettings;
    setSettings: (settings: IWebcamSettings) => void;
}

export default function WebcamSettings({ settings, setSettings }: Props) {
    return (
        <>
            <div className={style.formfield}>
                <span>Interval:</span>
                <TextField
                    hiddenLabel
                    id="interval"
                    variant="filled"
                    type="number"
                    value={settings.interval}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        setSettings({
                            ...settings,
                            interval: event.target.valueAsNumber,
                        });
                    }}
                />
                <span>seconds</span>
            </div>
            <div className={style.formfield}>
                <span>Count:</span>
                <TextField
                    hiddenLabel
                    id="count"
                    variant="filled"
                    type="number"
                    value={settings.count}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        setSettings({
                            ...settings,
                            count: event.target.valueAsNumber,
                        });
                    }}
                />
            </div>
            <div className={style.formfield}>
                <span>Delay:</span>
                <TextField
                    hiddenLabel
                    id="delay"
                    variant="filled"
                    type="number"
                    value={settings.delay}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                        setSettings({
                            ...settings,
                            delay: event.target.valueAsNumber,
                        });
                    }}
                />
                <span>seconds</span>
            </div>
        </>
    );
}
