import { useState, useEffect } from 'react';
import MusicNoteIcon from '@mui/icons-material/MusicNote';

interface Props {
    uri: string;
    play: boolean;
    volume?: number;
    showIcon?: boolean;
    loop?: boolean;
}

export default function AudioPlayer({ uri, play, volume, showIcon, loop }: Props) {
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

    useEffect(
        () =>
            setAudio((old: HTMLAudioElement | null) => {
                if (old) old.pause();
                return new Audio(uri);
            }),
        [uri]
    );

    useEffect(() => {
        if (audio) {
            audio.volume = volume === undefined ? 1.0 : volume;
        }
    }, [volume, audio]);

    useEffect(() => {
        if (audio) {
            if (play) {
                audio.loop = loop || false;
                audio.play()?.catch((e) => console.error(e));
            } else {
                audio.pause();
            }
        }
    }, [play, audio, loop]);

    useEffect(
        () => () => {
            if (audio) audio.pause();
            // eslint-disable-next-line react-hooks/exhaustive-deps
        },
        [audio]
    );

    return showIcon && play ? (
        <MusicNoteIcon
            data-testid="audio-output-icon"
            color="primary"
            sx={{ fontSize: 128 }}
        />
    ) : (
        <div data-testid="audio-output"></div>
    );
}
