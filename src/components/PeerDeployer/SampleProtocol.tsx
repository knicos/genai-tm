import { usePeerData } from '@genai-fi/base/hooks/peer';
import { AddSampleEvent, DeleteSampleEvent, EventProtocol } from './events';
import { canvasFromURL, Connection } from '@genai-fi/base';
import { TeachableModel } from '@genai-fi/classifier';
import { useEffect, useRef } from 'react';
import { behaviourState, classState, inputImage } from '@genaitm/state';
import { BehaviourType } from '../../workflow/Behaviour/Behaviour';
import { useTeachableModel } from '@genaitm/util/TeachableModel';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';

interface CacheState {
    model?: TeachableModel;
    behaviours?: BehaviourType[];
    reference?: number[];
    predictions?: number[];
    classNames?: string[];
    samples?: string[][];
}

export default function SampleProtocol() {
    const { model } = useTeachableModel();
    const behaviours = useAtomValue(behaviourState);
    const cache = useRef<CacheState>({ model, behaviours });
    const setInput = useSetAtom(inputImage);
    const [classes, setClassData] = useAtom(classState);

    cache.current.model = model;
    cache.current.behaviours = behaviours;
    cache.current.predictions = undefined;
    cache.current.reference = undefined;

    usePeerData(async (data: EventProtocol, conn: Connection<EventProtocol>) => {
        if (data.event === 'request_class') {
            if (cache.current.classNames) {
                conn.send({ event: 'class', labels: cache.current.classNames, samples: cache.current.samples });
            }
        } else if (data.event === 'add_sample') {
            const sev = data as AddSampleEvent;
            const newImage = await canvasFromURL(sev.data);
            if (sev.index === -1) {
                setInput(newImage);
            } else {
                setClassData((old) => {
                    const newData = [...old];
                    if (newData.length > sev.index) {
                        newData[sev.index] = {
                            samples: [{ data: newImage, id: sev.id }, ...newData[sev.index].samples],
                            label: old[sev.index].label,
                        };
                        conn.send({ event: 'sample_state', state: 'added', id: sev.id });
                    }
                    return newData;
                });
            }
        } else if (data.event === 'delete_sample') {
            const sev = data as DeleteSampleEvent;
            setClassData((old) => {
                if (old.length > sev.index) {
                    const newData = [...old];
                    newData[sev.index] = {
                        label: old[sev.index].label,
                        samples: old[sev.index].samples.filter((s) => s.id !== sev.id),
                    };
                    conn.send({ event: 'sample_state', state: 'deleted', id: sev.id });
                    return newData;
                }
                return old;
            });
        }
    });

    useEffect(() => {
        cache.current.classNames = classes.map((c) => c.label);
        cache.current.samples = classes.map((c) => c.samples.map((s) => s.id));
    }, [classes]);

    return null;
}
