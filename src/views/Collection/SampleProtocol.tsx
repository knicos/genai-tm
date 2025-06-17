import { Connection } from '@genai-fi/base';
import { usePeerClose, usePeerConnect, usePeerData } from '@genai-fi/base/hooks/peer';
import { EventProtocol } from '@genaitm/components/PeerDeployer/events';
import { useRef } from 'react';

const POLLING = 5000;

interface Props {
    onLabels: (labels: string[]) => void;
    onSamplesUpdate?: (samples: Set<string>[]) => void;
    onSampleState: (id: string, state: 'added' | 'deleted') => void;
}

export default function SampleProtocol({ onLabels, onSamplesUpdate, onSampleState }: Props) {
    const pollRef = useRef<number>(-1);
    const pollWaiting = useRef(false);

    usePeerData(async (data: EventProtocol, conn: Connection<EventProtocol>) => {
        if (data.event === 'class') {
            pollWaiting.current = false;
            onLabels(data.labels);

            const newSampleIDs = data.samples?.map((s: string[]) => {
                const newSet = new Set<string>();
                s.forEach((a) => newSet.add(a));
                return newSet;
            });

            if (onSamplesUpdate && newSampleIDs) onSamplesUpdate(newSampleIDs);
        } else if (data?.event === 'sample_state') {
            onSampleState(data?.id, data?.state);
            conn.send({ event: 'request_class' });
        }
    });

    usePeerConnect((conn: Connection<EventProtocol>) => {
        conn.send({ event: 'request_class' });
        pollRef.current = window.setInterval(() => {
            if (pollWaiting.current) {
                return;
            }
            pollWaiting.current = true;
            conn.send({ event: 'request_class' });
        }, POLLING);
        /*setSampleFuncs({
                send: (img: HTMLCanvasElement, classIndex: number, id: string) => {
                    conn.send({ event: 'add_sample', data: img.toDataURL(), index: classIndex, id });
                },
                delete: (classIndex: number, id: string) => {
                    conn.send({ event: 'delete_sample', index: classIndex, id });
                },
            });*/
    });

    usePeerClose(() => {
        if (pollRef.current >= 0) clearInterval(pollRef.current);
        pollWaiting.current = false;
    });

    return null;
}
