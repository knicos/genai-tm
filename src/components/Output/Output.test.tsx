import React from 'react';
import { render, screen } from '@testing-library/react';
import Output from './Output';
import TestWrapper from '../../util/TestWrapper';
import { MutableSnapshot } from 'recoil';
import { behaviourState, predictedIndex } from '../../state';

describe('Output component', () => {
    it('renders no behaviours', async () => {
        function NoPredWrapper({ children }: React.PropsWithChildren) {
            return (
                <TestWrapper
                    initializeState={(snap: MutableSnapshot) => {
                        snap.set(predictedIndex, -1);
                        snap.set(behaviourState, [
                            {
                                label: 'testClass',
                                text: { text: 'Message' },
                            },
                        ]);
                    }}
                >
                    {children}
                </TestWrapper>
            );
        }
        render(<Output />, { wrapper: NoPredWrapper });
        expect(screen.getByTestId('text-output')).not.toBeVisible();
    });

    it('renders a text behaviour', async () => {
        function PredWrapper({ children }: React.PropsWithChildren) {
            return (
                <TestWrapper
                    initializeState={(snap: MutableSnapshot) => {
                        snap.set(predictedIndex, 0);
                        snap.set(behaviourState, [
                            {
                                label: 'testClass',
                                text: { text: 'Message' },
                            },
                        ]);
                    }}
                >
                    {children}
                </TestWrapper>
            );
        }
        render(<Output />, { wrapper: PredWrapper });
        expect(screen.getByTestId('text-output')).toBeInTheDocument();
        expect(screen.getByText('Message')).toBeVisible();
    });

    it('renders the correct behaviour index', async () => {
        function PredWrapper({ children }: React.PropsWithChildren) {
            return (
                <TestWrapper
                    initializeState={(snap: MutableSnapshot) => {
                        snap.set(predictedIndex, 1);
                        snap.set(behaviourState, [
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
                    }}
                >
                    {children}
                </TestWrapper>
            );
        }
        render(<Output />, { wrapper: PredWrapper });
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
                        snap.set(behaviourState, [
                            {
                                label: 'testClass',
                                image: { uri: 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Test.svg' },
                            },
                        ]);
                    }}
                >
                    {children}
                </TestWrapper>
            );
        }
        render(<Output />, { wrapper: PredWrapper });
        expect(screen.getByTestId('image-output')).toBeInTheDocument();
    });

    it('renders an audio behaviour', async () => {
        function PredWrapper({ children }: React.PropsWithChildren) {
            return (
                <TestWrapper
                    initializeState={(snap: MutableSnapshot) => {
                        snap.set(predictedIndex, 0);
                        snap.set(behaviourState, [
                            {
                                label: 'testClass',
                                audio: { name: 'music.mp3', uri: '' },
                            },
                        ]);
                    }}
                >
                    {children}
                </TestWrapper>
            );
        }
        render(<Output />, { wrapper: PredWrapper });
        expect(screen.getByTestId('audio-output-icon')).toBeVisible();
    });

    it('renders an embed image behaviour', async () => {
        function PredWrapper({ children }: React.PropsWithChildren) {
            return (
                <TestWrapper
                    initializeState={(snap: MutableSnapshot) => {
                        snap.set(predictedIndex, 0);
                        snap.set(behaviourState, [
                            {
                                label: 'testClass',
                                embed: { url: 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Test.svg' },
                            },
                        ]);
                    }}
                >
                    {children}
                </TestWrapper>
            );
        }
        render(<Output />, { wrapper: PredWrapper });
        expect(screen.getByTestId('embed-image')).toBeInTheDocument();
    });
});
