import { usePeerData, usePeerSender, usePeerStatus } from '@genai-fi/base/hooks/peer';
import { TeachableModel } from '@genai-fi/classifier';
import { BehaviourType } from '@genaitm/workflow/Behaviour/Behaviour';
import { loadProject } from '@genaitm/workflow/ImageWorkspace/loader';
import { EventProtocol } from '@genaitm/components/PeerDeployer/events';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router';

interface Props {
    code: string;
    onModel: (model: TeachableModel) => void;
    onBehaviours: (behaviours: BehaviourType[]) => void;
    onError?: () => void;
    onDone: () => void;
}

export default function ProjectProtocol({ code, onModel, onBehaviours, onError, onDone }: Props) {
    const [params] = useSearchParams();

    usePeerData(async (data: EventProtocol) => {
        console.log('ProjectProtocol: Received data', data);
        if (data.event === 'project' && data.project instanceof Uint8Array) {
            try {
                const project = await loadProject(data.project);

                /*setData(
                                project.samples
                                    ? project.samples.map((s, i) => ({ label: project.labels?.[i] || '', samples: s }))
                                    : []
                            );*/

                if (project.model) {
                    onModel(project.model);
                }
                if (project.behaviours) {
                    onBehaviours(project.behaviours);
                }
            } catch (e) {
                if (onError) onError();
                console.log('Error', e);
            }

            onDone();
        }
    });

    const send = usePeerSender<EventProtocol>();
    const ready = usePeerStatus() === 'ready';

    useEffect(() => {
        if (ready && send) {
            console.log('ProjectProtocol: Sending request for project', code, ready, send);
            send({ event: 'request', channel: code, password: params.get('p') || undefined });
        }
    }, [ready, send]);

    return null;
}
