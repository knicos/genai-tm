import React, { useState, useEffect } from 'react';
import MusicNoteIcon from '@mui/icons-material/MusicNote';

interface Props {
    uri: string;
    play: boolean;
    volume?: number;
    showIcon?: boolean;
}

export default function AudioPlayer({ uri, play, volume, showIcon }: Props) {
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
                audio.loop = true;
                audio.play();
            } else {
                audio.pause();
            }
        }
    }, [play, audio]);

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
            sx={{ color: 'white', fontSize: 128 }}
        />
    ) : (
        <div data-testid="audio-output"></div>
    );
}
