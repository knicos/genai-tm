import { describe, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Sound from './Audio';
import userEvent from '@testing-library/user-event';

describe('Audio behaviour component', () => {
    it('renders without a behaviour', async ({ expect }) => {
        const setBehaviour = vi.fn();
        render(<Sound setBehaviour={setBehaviour} />);
        expect(screen.getByTestId('audio-upload')).toBeInTheDocument();
        expect(screen.getByTestId('audio-delete')).toBeDisabled();
        expect(screen.getByTestId('audio-play')).toBeDisabled();
    });

    it('renders with a behaviour', async ({ expect }) => {
        const setBehaviour = vi.fn();
        render(
            <Sound
                setBehaviour={setBehaviour}
                behaviour={{
                    name: 'filename goes here',
                    uri: 'http://example.com',
                }}
            />
        );
        expect(screen.getByTestId('audio-upload')).toBeInTheDocument();
        expect(screen.getByTestId('audio-delete')).toBeEnabled();
        expect(screen.getByTestId('audio-play')).toBeEnabled();
    });

    it('can delete a behaviour', async ({ expect }) => {
        const setBehaviour = vi.fn();
        const user = userEvent.setup();

        render(
            <Sound
                setBehaviour={setBehaviour}
                behaviour={{
                    name: 'filename goes here',
                    uri: 'http://example.com',
                }}
            />
        );

        await user.click(screen.getByTestId('audio-delete'));
        expect(setBehaviour).toHaveBeenCalledWith(undefined);
    });
});
