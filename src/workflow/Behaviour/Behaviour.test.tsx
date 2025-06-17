import { describe, it, vi } from 'vitest';
import { act, render, screen, within } from '@testing-library/react';
import Behaviour from './Behaviour';
import userEvent from '@testing-library/user-event';
import TestWrapper from '../../util/TestWrapper';

describe('Behaviour component', () => {
    it('renders without a behaviour', async ({ expect }) => {
        const setBehaviour = vi.fn();
        render(
            <Behaviour
                index={0}
                behaviour={{ label: 'testClass' }}
                classLabel="testClass"
                setBehaviour={setBehaviour}
            />,
            { wrapper: TestWrapper }
        );
        expect(screen.getByTestId('text-message')).toBeInTheDocument();
        expect(screen.getByTestId('image-option')).toBeInTheDocument();
        expect(screen.getByTestId('audio-option')).toBeInTheDocument();
        expect(screen.getByTestId('text-option')).toBeInTheDocument();
    });

    it('can change behaviour type', async ({ expect }) => {
        const user = userEvent.setup();
        const setBehaviour = vi.fn();
        render(
            <Behaviour
                index={0}
                behaviour={{ label: 'testClass' }}
                classLabel="testClass"
                setBehaviour={setBehaviour}
            />,
            { wrapper: TestWrapper }
        );

        const button = screen.getByTestId('text-option');
        await user.click(button);
        expect(screen.getByTestId('text-message')).toBeInTheDocument();
    });

    it('can set a text behaviour', async ({ expect }) => {
        const user = userEvent.setup();
        const setBehaviour = vi.fn();
        render(
            <Behaviour
                index={0}
                behaviour={{ label: 'testClass', text: { text: 'Test Message' } }}
                classLabel="testClass"
                setBehaviour={setBehaviour}
            />,
            { wrapper: TestWrapper }
        );

        const button = screen.getByTestId('text-option');
        await user.click(button);
        const textarea = within(screen.getByTestId('text-message')).getByDisplayValue('Test Message');
        await user.click(textarea);
        await user.clear(textarea);
        await user.keyboard('Another message');
        act(() => textarea.blur());
        expect(textarea).toHaveValue('Another message');
        expect(setBehaviour).toHaveBeenCalledWith({ label: 'testClass', text: { text: 'Another message' } }, 0);
    });
});
