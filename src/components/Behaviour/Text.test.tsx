import { describe, it, vi } from 'vitest';
import { act, render, screen, within } from '@testing-library/react';
import TextBehaviour from './Text';
import userEvent from '@testing-library/user-event';

describe('Text behaviour component', () => {
    it('renders without a behaviour', async ({ expect }) => {
        const setBehaviour = vi.fn();
        render(
            <TextBehaviour
                id="someid"
                setBehaviour={setBehaviour}
            />
        );
        expect(within(screen.getByTestId('text-message')).getByDisplayValue('')).toBeInTheDocument();
    });

    it('renders with a behaviour', async ({ expect }) => {
        const setBehaviour = vi.fn();
        render(
            <TextBehaviour
                id="someid"
                setBehaviour={setBehaviour}
                behaviour={{
                    text: 'Some test text',
                }}
            />
        );
        expect(within(screen.getByTestId('text-message')).getByDisplayValue('Some test text')).toBeInTheDocument();
    });

    it('can delete a behaviour', async ({ expect }) => {
        const setBehaviour = vi.fn();
        const user = userEvent.setup();

        render(
            <TextBehaviour
                id="someid"
                setBehaviour={setBehaviour}
                behaviour={{
                    text: 'Some test text',
                }}
            />
        );

        const textarea = within(screen.getByTestId('text-message')).getByDisplayValue('Some test text');
        await user.clear(textarea);
        act(() => textarea.blur());
        expect(setBehaviour).toHaveBeenCalledWith(undefined);
    });
});
