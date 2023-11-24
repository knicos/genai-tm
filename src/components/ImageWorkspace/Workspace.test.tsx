import { describe, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import ImageWorkspace from './Workspace';
import TestWrapper from '../../util/TestWrapper';

describe('ImageWorkspace component', () => {
    it('renders step 1', async ({ expect }) => {
        const complete = vi.fn();
        const skip = vi.fn();
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
        await waitFor(() => expect(screen.getByText('behaviours.labels.title')).not.toBeVisible());
        expect(await screen.findByTestId('widget-trainingdata.labels.class 1')).toBeInTheDocument();
    });

    it('renders step 2', async ({ expect }) => {
        const complete = vi.fn();
        const skip = vi.fn();
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
        await waitFor(() => expect(screen.getByText('behaviours.labels.title')).toBeVisible());
        expect(screen.getByTestId('widget-output.labels.title')).toBeVisible();
    });
});
