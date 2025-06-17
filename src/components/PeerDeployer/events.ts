import { PeerEvent } from '@genai-fi/base';
import { AnalysisType, ModelStatsType } from './analysis';

type ProjectKind = 'image';

export interface DeployEvent extends PeerEvent {
    event: 'request' | 'project' | 'model' | 'add_sample' | 'request_class' | 'delete_sample';
}

export interface AddSampleEvent extends DeployEvent {
    event: 'add_sample';
    data: string;
    index: number;
    id: string;
}

export interface DeleteSampleEvent extends DeployEvent {
    event: 'delete_sample';
    index: number;
    id: string;
}

export interface RequestClassEvent extends DeployEvent {
    event: 'request_class';
}

export interface DeployEventRequest extends DeployEvent {
    event: 'request';
    channel?: string;
    entity?: 'model' | 'metadata' | 'project' | 'weights';
    password?: string;
}

export interface DeployEventData extends DeployEvent {
    event: 'project';
    project?: Blob;
    kind: ProjectKind;
}

export interface ModelEventData extends DeployEvent {
    event: 'model';
    component: 'model' | 'metadata' | 'weights';
    data?: string | ArrayBuffer;
}

export interface ClassEvent extends PeerEvent {
    event: 'class';
    labels: string[];
    samples?: string[][];
}

export interface SampleStateEvent extends PeerEvent {
    event: 'sample_state';
    state: 'added' | 'deleted';
    id: string;
}

export interface AnalysisEvent extends PeerEvent, AnalysisType, ModelStatsType {
    event: 'analysis';
}

export type EventProtocol =
    | DeployEventRequest
    | DeployEventData
    | ModelEventData
    | AddSampleEvent
    | DeleteSampleEvent
    | ClassEvent
    | SampleStateEvent
    | AnalysisEvent
    | RequestClassEvent;
