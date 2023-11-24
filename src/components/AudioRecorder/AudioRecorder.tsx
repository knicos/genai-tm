import { useState, useEffect, useRef, useCallback } from 'react';
import { VerticalButton } from '../button/Button';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import { useTranslation } from 'react-i18next';
import { useVariant } from '../../util/variant';

async function getRecorder() {
    if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
        throw new Error('Media devices not supported');
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    return new MediaRecorder(stream);
}

interface Props {
    onData: (audio: Blob) => void;
}

const MAXDURATION = 30;

export default function AudioRecorder({ onData }: Props) {
    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);
    const recorder = useRef<MediaRecorder>();
    const [ready, setReady] = useState(false);
    const [record, setRecord] = useState(false);
    const timeout = useRef(-1);

    useEffect(() => {
        getRecorder()
            .then((r) => {
                recorder.current = r;
                setReady(true);
            })
            .catch(() => {
                setReady(false);
            });
    }, []);

    useEffect(() => {
        if (ready && recorder.current) {
            if (record) {
                recorder.current.ondataavailable = (ev: BlobEvent) => {
                    onData(ev.data);
                };
                if (recorder.current.state === 'inactive') {
                    recorder.current.start();
                    timeout.current = window.setTimeout(() => setRecord(false), MAXDURATION * 1000);
                }
            } else {
                if (recorder.current.state === 'recording') {
                    recorder.current.stop();
                    clearTimeout(timeout.current);
                }
            }
        }
    }, [ready, record, onData]);

    const doRecord = useCallback(() => {
        setRecord((old) => !old);
    }, [setRecord]);

    return (
        <VerticalButton
            data-testid="audio-record"
            variant="outlined"
            startIcon={record ? <StopIcon /> : <MicIcon />}
            onClick={doRecord}
            disabled={!ready}
            style={{ color: record ? 'red' : '' }}
        >
            {record ? t('behaviours.actions.stop') : t('behaviours.actions.record')}
        </VerticalButton>
    );
}
