import { Button } from '@genai-fi/base';
import { AudioExample } from '@genai-fi/classifier';
import { useCallback, useState } from 'react';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import { useTranslation } from 'react-i18next';
import { useVariant } from '@genaitm/util/variant';
import CapturePanel from '../CapturePanel/CapturePanel';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AudioInput from './AudioInput';

interface Props {
    className: string;
    onExample: (example: AudioExample) => void;
    onClose: () => void;
    blob?: Blob | null;
}

export default function AudioExampleRecorder({ className, onExample, onClose, blob }: Props) {
    const { namespace } = useVariant();
    const { t } = useTranslation(namespace);
    const [recording, setRecording] = useState(false);

    const doStop = useCallback(() => setRecording(false), [setRecording]);

    return (
        <CapturePanel
            title={blob ? 'File' : t('trainingdata.actions.audio')}
            onClose={onClose}
        >
            <AudioInput
                onExample={onExample}
                blob={blob ?? undefined}
                label={className}
                recording={!!blob || recording}
                onStop={doStop}
                includeCanvas
                includeRawAudio
                showDuration
                duration={20000}
                allowReplay={!!blob}
            />
            {!blob && (
                <Button
                    variant="contained"
                    aria-pressed={recording}
                    aria-label={recording ? t('trainingdata.labels.stop') : t('trainingdata.actions.record')}
                    onClick={() => {
                        setRecording((old) => !old);
                    }}
                    startIcon={recording ? <StopIcon /> : blob ? <PlayArrowIcon /> : <MicIcon />}
                >
                    {recording ? t('trainingdata.labels.stop') : t('trainingdata.actions.record')}
                </Button>
            )}
        </CapturePanel>
    );
}
