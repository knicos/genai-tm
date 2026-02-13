import { describe, it, vi } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import Output from './Output';
import TestWrapper from '../../util/TestWrapper';
import { createStore } from 'jotai';
import { behaviourState, predictedIndex, serialWriterInstance } from '../../state';

const writeMock = vi.fn().mockResolvedValue(undefined);

const mockPort: SerialPort = {
    open: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined),
    readable: null,
    writable: {
        locked: false,
        getWriter: vi.fn(() => ({
            write: writeMock,
            releaseLock: vi.fn(),
            closed: Promise.resolve(),
            desiredSize: 1024,
            ready: Promise.resolve(),
            abort: vi.fn(),
            close: vi.fn(),
        })),
        abort: vi.fn(),
        close: vi.fn(),
    },
    onconnect: null,
    ondisconnect: null,
    getInfo: vi.fn(),
    forget: vi.fn(),
    connected: true,
    setSignals: vi.fn(),
    getSignals: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
};

describe('Output component', () => {
    it('renders no behaviours', async ({ expect }) => {
        const store = createStore();
        store.set(predictedIndex, -1);
        store.set(behaviourState, [
            {
                label: 'testClass',
                text: { text: 'Message' },
            },
        ]);

        function NoPredWrapper({ children }: React.PropsWithChildren) {
            return <TestWrapper initializeState={store}>{children}</TestWrapper>;
        }
        render(<Output />, { wrapper: NoPredWrapper });
        expect(screen.getByTestId('text-output')).not.toBeVisible();
    });

    it('renders a text behaviour', async ({ expect }) => {
        const store = createStore();
        store.set(predictedIndex, 0);
        store.set(behaviourState, [
            {
                label: 'testClass',
                text: { text: 'Message' },
            },
        ]);

        function PredWrapper({ children }: React.PropsWithChildren) {
            return <TestWrapper initializeState={store}>{children}</TestWrapper>;
        }
        render(<Output />, { wrapper: PredWrapper });
        expect(screen.getByTestId('text-output')).toBeInTheDocument();
        expect(screen.getByText('Message')).toBeVisible();
    });

    it('renders the correct behaviour index', async ({ expect }) => {
        const store = createStore();
        store.set(predictedIndex, 1);
        store.set(behaviourState, [
            {
                label: 'testClass',
                text: { text: 'Message1' },
            },
            {
                label: 'testClass',
                text: { text: 'Message2' },
            },
            {
                label: 'testClass',
                text: { text: 'Message3' },
            },
        ]);

        function PredWrapper({ children }: React.PropsWithChildren) {
            return <TestWrapper initializeState={store}>{children}</TestWrapper>;
        }
        render(<Output />, { wrapper: PredWrapper });
        expect(screen.getByText('Message2')).toBeVisible();
        expect(screen.getByText('Message1')).not.toBeVisible();
        expect(screen.getByText('Message3')).not.toBeVisible();
    });

    it('renders an image behaviour', async ({ expect }) => {
        const store = createStore();
        store.set(predictedIndex, 0);
        store.set(behaviourState, [
            {
                label: 'testClass',
                image: { uri: 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Test.svg' },
            },
        ]);

        function PredWrapper({ children }: React.PropsWithChildren) {
            return <TestWrapper initializeState={store}>{children}</TestWrapper>;
        }
        render(<Output />, { wrapper: PredWrapper });
        expect(screen.getByTestId('image-output')).toBeInTheDocument();
    });

    it('renders an audio behaviour', async ({ expect }) => {
        const store = createStore();
        store.set(predictedIndex, 0);
        store.set(behaviourState, [
            {
                label: 'testClass',
                audio: { name: 'music.mp3', uri: '' },
            },
        ]);

        function PredWrapper({ children }: React.PropsWithChildren) {
            return <TestWrapper initializeState={store}>{children}</TestWrapper>;
        }
        render(<Output />, { wrapper: PredWrapper });
        expect(screen.getByTestId('audio-output-icon')).toBeVisible();
    });

    it('renders an embed image behaviour', async ({ expect }) => {
        const store = createStore();
        store.set(predictedIndex, 0);
        store.set(behaviourState, [
            {
                label: 'testClass',
                embed: { url: 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Test.svg' },
            },
        ]);

        function PredWrapper({ children }: React.PropsWithChildren) {
            return <TestWrapper initializeState={store}>{children}</TestWrapper>;
        }
        render(<Output />, { wrapper: PredWrapper });
        expect(screen.getByTestId('embed-image')).toBeInTheDocument();
    });

    it('renders an serial behaviour', async ({ expect }) => {
        await mockPort.open({ baudRate: 9600 });
        const store = createStore();
        if (mockPort.writable) store.set(serialWriterInstance, mockPort.writable.getWriter());
        store.set(predictedIndex, 0);
        store.set(behaviourState, [
            {
                label: 'testClass',
            },
        ]);
        function PredWrapper({ children }: React.PropsWithChildren) {
            return <TestWrapper initializeState={store}>{children}</TestWrapper>;
        }
        render(<Output />, { wrapper: PredWrapper });
        expect(screen.getByTestId('serial-output-icon')).toBeInTheDocument();
    });
    
    it('renders an serial behaviour', async ({ expect }) => {
        await mockPort.open({ baudRate: 9600 });
        const store = createStore();
        const encoder = new TextEncoder();
        if (mockPort.writable) store.set(serialWriterInstance, mockPort.writable.getWriter());
        store.set(predictedIndex, 0);
        store.set(behaviourState, [
            {
                label: 'testClass',
            },
        ]);
        function PredWrapper({ children }: React.PropsWithChildren) {
            return <TestWrapper initializeState={store}>{children}</TestWrapper>;
        }
        render(<Output />, { wrapper: PredWrapper });
        expect(mockPort.writable?.getWriter).toHaveBeenCalled();
        expect(writeMock).toHaveBeenCalledTimes(1);
        expect(writeMock).toHaveBeenCalledWith(encoder.encode('1'));
    });
});
