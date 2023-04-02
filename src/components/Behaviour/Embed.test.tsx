import React from 'react';
import { act, render, screen, within } from '@testing-library/react';
import EmbedBehaviour from './Embed';
import userEvent from '@testing-library/user-event';

describe('Embed behaviour component', () => {
    it('renders without a behaviour', async () => {
        const setBehaviour = jest.fn();
        render(<EmbedBehaviour setBehaviour={setBehaviour} />);
        expect(within(screen.getByTestId('link-message')).getByDisplayValue('')).toBeInTheDocument();
    });

    it('renders with an image link', async () => {
        const setBehaviour = jest.fn();
        render(
            <EmbedBehaviour
                setBehaviour={setBehaviour}
                behaviour={{
                    url: 'http://example.com/image.png',
                }}
            />
        );
        expect(
            within(screen.getByTestId('link-message')).getByDisplayValue('http://example.com/image.png')
        ).toBeInTheDocument();
        expect(screen.getByTestId('image-link-icon')).toBeVisible();
    });

    it('can delete a behaviour', async () => {
        const setBehaviour = jest.fn();
        const user = userEvent.setup();

        render(
            <EmbedBehaviour
                setBehaviour={setBehaviour}
                behaviour={{
                    url: 'http://example.com/image.png',
                }}
            />
        );

        const textarea = within(screen.getByTestId('link-message')).getByDisplayValue('http://example.com/image.png');
        await user.clear(textarea);
        act(() => textarea.blur());
        expect(setBehaviour).toHaveBeenCalledWith(undefined);
    });
});
