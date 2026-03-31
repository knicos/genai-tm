import { NativeSelect } from '@mui/material';
import { useEffect, useState } from 'react';

interface Props {
    deviceId?: string;
    onSelect: (deviceId: string) => void;
}

export default function MicSelect({ deviceId, onSelect }: Props) {
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

    useEffect(() => {
        navigator.mediaDevices
            .enumerateDevices()
            .then((devices) => {
                const mics = devices.filter((device) => device.kind === 'audioinput');
                setDevices(mics);
            })
            .catch((err) => {
                console.error('Error enumerating devices:', err);
            });
    }, []);

    return (
        <NativeSelect
            value={deviceId ?? devices[0]?.deviceId ?? 'default'}
            onChange={(e) => onSelect(e.target.value)}
            fullWidth={false}
            style={{ maxWidth: 200, marginBottom: 8 }}
        >
            {devices.map((device) => (
                <option
                    key={device.deviceId}
                    value={device.deviceId}
                >
                    {device.label || `Microphone ${device.deviceId}`}
                </option>
            ))}
        </NativeSelect>
    );
}
