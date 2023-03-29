import React from 'react';
import { render, screen } from '@testing-library/react';
import Output from './Output';
import TestWrapper from '../../util/TestWrapper';
import { MutableSnapshot } from 'recoil';
import { predictedIndex } from '../../state';

describe('Output component', () => {
    it('renders no behaviours', async () => {
        function NoPredWrapper({ children }: React.PropsWithChildren) {
            return (
                <TestWrapper
                    initializeState={(snap: MutableSnapshot) => {
                        snap.set(predictedIndex, -1);
                    }}
                >
                    {children}
                </TestWrapper>
            );
        }
        render(
            <Output
                behaviours={[
                    {
                        text: { text: 'Message' },
                    },
                ]}
            />,
            { wrapper: NoPredWrapper }
        );
        expect(screen.getByTestId('text-output')).not.toBeVisible();
    });

    it('renders a text behaviour', async () => {
        function PredWrapper({ children }: React.PropsWithChildren) {
            return (
                <TestWrapper
                    initializeState={(snap: MutableSnapshot) => {
                        snap.set(predictedIndex, 0);
                    }}
                >
                    {children}
                </TestWrapper>
            );
        }
        render(
            <Output
                behaviours={[
                    {
                        text: { text: 'Message' },
                    },
                ]}
            />,
            { wrapper: PredWrapper }
        );
        expect(screen.getByTestId('text-output')).toBeInTheDocument();
        expect(screen.getByText('Message')).toBeVisible();
    });

    it('renders the correct behaviour index', async () => {
        function PredWrapper({ children }: React.PropsWithChildren) {
            return (
                <TestWrapper
                    initializeState={(snap: MutableSnapshot) => {
                        snap.set(predictedIndex, 1);
                    }}
                >
                    {children}
                </TestWrapper>
            );
        }
        render(
            <Output
                behaviours={[
                    {
                        text: { text: 'Message1' },
                    },
                    {
                        text: { text: 'Message2' },
                    },
                    {
                        text: { text: 'Message3' },
                    },
                ]}
            />,
            { wrapper: PredWrapper }
        );
        expect(screen.getByText('Message2')).toBeVisible();
        expect(screen.getByText('Message1')).not.toBeVisible();
        expect(screen.getByText('Message3')).not.toBeVisible();
    });

    it('renders an image behaviour', async () => {
        function PredWrapper({ children }: React.PropsWithChildren) {
            return (
                <TestWrapper
                    initializeState={(snap: MutableSnapshot) => {
                        snap.set(predictedIndex, 0);
                    }}
                >
                    {children}
                </TestWrapper>
            );
        }
        render(
            <Output
                behaviours={[
                    {
                        image: { uri: 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Test.svg' },
                    },
                ]}
            />,
            { wrapper: PredWrapper }
        );
        expect(screen.getByTestId('image-output')).toBeInTheDocument();
    });

    it('renders an audio behaviour', async () => {
        function PredWrapper({ children }: React.PropsWithChildren) {
            return (
                <TestWrapper
                    initializeState={(snap: MutableSnapshot) => {
                        snap.set(predictedIndex, 0);
                    }}
                >
                    {children}
                </TestWrapper>
            );
        }
        render(
            <Output
                behaviours={[
                    {
                        audio: { name: 'music.mp3', uri: '' },
                    },
                ]}
            />,
            { wrapper: PredWrapper }
        );
        expect(screen.getByTestId('audio-output-icon')).toBeVisible();
    });
});
