import React, { useState, useEffect, useRef } from "react";
import { Webcam as TMWebcam } from "@teachablemachine/image";

interface Props {
    interval?: number;
    capture?: boolean;
    onCapture?: (image: HTMLImageElement) => void;
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
                const newImage = document.createElement('img');
                newImage.src = webcam.canvas.toDataURL();
                onCapture(newImage);
                previousTimeRef.current = timestamp;
            }
        }
        requestRef.current = window.requestAnimationFrame(loop);
    }

    async function initWebcam() {
        const newWebcam = new TMWebcam(200, 200, true);
        await newWebcam.setup();
        setWebcam(newWebcam);
    }

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
            requestRef.current = window.requestAnimationFrame(loop);
        }
    }, [webcamRef, webcam]);

    return <div ref={webcamRef} />;
}
