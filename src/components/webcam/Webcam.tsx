import React, { useState, useEffect, useRef } from "react";
import { Webcam as TMWebcam } from "@teachablemachine/image";
import style from "./webcam.module.css";

interface Props {
    interval?: number;
    capture?: boolean;
    onCapture?: (image: HTMLCanvasElement) => void;
}

export function Webcam({interval, capture, onCapture}: Props) {
    const [webcam, setWebcam] = useState<TMWebcam | null>(null);
    const webcamRef = useRef<HTMLDivElement>(null);
    const requestRef = useRef(-1);
    const previousTimeRef = useRef(0);

    function loop(timestamp: number) {
        if (webcam) {
            if (previousTimeRef.current === 0) {
                previousTimeRef.current = timestamp;
            }
            webcam.update();
            const actualInterval = (interval !== undefined) ? interval : 1000.0;
            if (capture && onCapture && (timestamp - previousTimeRef.current) >= actualInterval) {
                const newImage = document.createElement('canvas');
                newImage.width = webcam.canvas.width;
                newImage.height = webcam.canvas.height;
                const context = newImage.getContext('2d');
                if (!context) console.error('Failed to get context');
                context?.drawImage(webcam.canvas, 0, 0);
                onCapture(newImage);
                previousTimeRef.current = timestamp;
            }
        }
        requestRef.current = window.requestAnimationFrame(loop);
    }

    async function initWebcam() {
        const newWebcam = new TMWebcam(224, 224, true);
        await newWebcam.setup();
        setWebcam(newWebcam);
    }

    useEffect(() => {
        if (capture) previousTimeRef.current = 0;
    }, [capture]);

    useEffect(() => {
        initWebcam();
        return () => {
            if (webcam) {
                webcam.stop();
            }
            if (requestRef.current >= 0) {
                console.log('Cancel animation', requestRef.current);
                window.cancelAnimationFrame(requestRef.current);
            }
        }
    }, []);

    useEffect(() => {
        if (webcam && webcamRef.current) {
            while (webcamRef.current.lastChild) {
                webcamRef.current.removeChild(webcamRef.current.lastChild);
            }
            webcamRef.current.appendChild(webcam.canvas);
            webcam.play();
            /*if (requestRef.current >= 0) {
                console.log('Cancel animation', requestRef.current);
                window.cancelAnimationFrame(requestRef.current);
            }
            requestRef.current = window.requestAnimationFrame(loop);*/
        }
    }, [webcamRef, webcam]);

    useEffect(() => {
        if (webcam) {
            if (requestRef.current >= 0) {
                console.log('Cancel animation', requestRef.current);
                window.cancelAnimationFrame(requestRef.current);
            }
            requestRef.current = window.requestAnimationFrame(loop);
        }
    }, [webcam, capture, onCapture, interval]);

    return <div className={style.container} ref={webcamRef} />;
}
