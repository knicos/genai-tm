import React from 'react';
import { render, screen } from '@testing-library/react';
import ImageWorkspace from './Workspace';
import TestWrapper from '../../util/TestWrapper';

describe('ImageWorkspace component', () => {
    it('renders step 1', async () => {
        const complete = jest.fn();
        const skip = jest.fn();
        render(
            <ImageWorkspace
                step={0}
                visitedStep={0}
                onComplete={complete}
                onSkip={skip}
                onSaveRemind={skip}
            />,
            { wrapper: TestWrapper }
        );
        expect(screen.getByText('behaviours.labels.title')).not.toBeVisible();
        expect(screen.getByTestId('widget-trainingdata.labels.class 1')).toBeInTheDocument();
    });

    it('renders step 2', async () => {
        const complete = jest.fn();
        const skip = jest.fn();
        render(
            <ImageWorkspace
                step={1}
                visitedStep={1}
                onComplete={complete}
                onSkip={skip}
                onSaveRemind={skip}
            />,
            { wrapper: TestWrapper }
        );
        expect(screen.getByText('behaviours.labels.title')).toBeVisible();
        expect(screen.getByTestId('widget-output.labels.title')).toBeVisible();
    });
});
