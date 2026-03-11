import { serialWriterInstance } from '@genaitm/state';
import { useVariant } from '@genaitm/util/variant';
import UsbIcon from '@mui/icons-material/Usb';
import { IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { Button } from '@genaitm/components/button/Button';
import { useAtom } from 'jotai';
import { useEffect, useRef, useState } from 'react';
import style from './Output.module.css';
import { useTranslation } from 'react-i18next';
import HelpIcon from '@mui/icons-material/Help';
export default function SerialUSBConnector() {
    const [serialUSBWriter, setSerialUSBWriter] = useAtom(serialWriterInstance);
    const [open, setOpen] = useState(false);
    const openPort = useRef<null | SerialPort>(null);
    const openWriter = useRef<null | WritableStreamDefaultWriter<Uint8Array<ArrayBufferLike>>>(null);
    const timeout = useRef<NodeJS.Timeout | null>(null);
    const [connceting, setConnceting] = useState(false);
    const [serialConnection, setSerialConnection] = useState(false);
    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);

    const handleDisconnect = async () => {
        openWriter.current?.releaseLock();
        setSerialUSBWriter(null);
        await portClose();
        setSerialConnection(false);
    };

    const portClose = async () => {
        if (openPort.current) {
            try {
                openPort.current.removeEventListener('disconnect', handleDisconnect);
                await openPort.current.close();
            } catch (e) {
                console.error(e);
            }
            openPort.current = null;
        }
    };

    const doInitiateSerial = async () => {
        try {
            //No device connected - request serialconnection and open the port
            if (serialUSBWriter == null) {
                setConnceting(true);
                const conn = await navigator.serial.requestPort();
                await conn.open({ baudRate: 9600 });
                openPort.current = conn;
                openPort.current.addEventListener('disconnect', handleDisconnect);
                if (conn?.writable && !conn.writable.locked) {
                    openWriter.current = conn.writable.getWriter();
                }
                setConnceting(false);
                setOpen(true);
                if (timeout.current) {
                    clearTimeout(timeout.current);
                }
                timeout.current = setTimeout(() => {
                    setOpen(false);
                }, 2000);
                setSerialConnection(true);
                setSerialUSBWriter(openWriter.current);
            }
            //disconnect port connection
            else {
                openWriter.current?.releaseLock();
                setSerialUSBWriter(null);
                setSerialConnection(false);
                await portClose();
            }
        } catch (e) {
            console.error(e);
            setOpen(true);
            setSerialUSBWriter(null);
            if (timeout.current) {
                clearTimeout(timeout.current);
            }
            timeout.current = setTimeout(() => {
                setOpen(false);
            }, 2000);
            setConnceting(false);
        }
    };

    const cleanupClose = async () => {
        if (openWriter.current) {
            openWriter.current.releaseLock();
            openWriter.current = null;
        }
        if (openPort.current) {
            openPort.current.removeEventListener('disconnect', handleDisconnect);
            try {
                await openPort.current.close();
                openPort.current = null;
            } catch (e) {
                console.error(e);
            }
        }
    };

    useEffect(() => {
        return () => {
            setSerialUSBWriter(null);
            if (timeout.current) {
                clearTimeout(timeout.current);
                timeout.current = null;
            }
            cleanupClose();
        };
    }, []);

    return (
        <Tooltip
            open={open}
            title={serialConnection ? t('output.labels.connectSuccess') : t('output.labels.connectError')}
        >
            <div className={style.SerialConnectContainer}>
                <Stack
                    direction={'row'}
                    gap={1}
                    alignItems="center"
                >
                    {<UsbIcon color={serialConnection ? 'success' : 'disabled'} />}
                    <Typography>{t('output.labels.serialdevice')}</Typography>
                    <IconButton
                        size="small"
                        color="secondary"
                        component="a"
                        href="https://www.gen-ai.fi/en/tools/TMMicrocontroller"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <HelpIcon />
                    </IconButton>
                </Stack>

                <Button
                    sx={{ textTransform: 'none' }}
                    variant="outlined"
                    disabled={open}
                    loading={connceting}
                    onClick={doInitiateSerial}
                    aria-label={t('output.aria.serialdevice')}
                >
                    {serialConnection ? t('output.labels.disconnect') : t('output.labels.connect')}
                </Button>
            </div>
        </Tooltip>
    );
}
