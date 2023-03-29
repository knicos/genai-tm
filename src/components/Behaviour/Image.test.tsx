import React from 'react';
import { render, screen } from '@testing-library/react';
import ImageBehaviour from './Image';
import userEvent from '@testing-library/user-event';

describe('Image behaviour component', () => {
    it('renders without a behaviour', async () => {
        const setBehaviour = jest.fn();
        render(<ImageBehaviour setBehaviour={setBehaviour} />);
        expect(screen.getByTestId('image-upload')).toBeInTheDocument();
        expect(screen.getByTestId('image-delete')).toBeDisabled();
        expect(screen.getByTestId('image-skeleton')).toBeInTheDocument();
    });

    it('renders with a behaviour', async () => {
        const setBehaviour = jest.fn();
        render(
            <ImageBehaviour
                setBehaviour={setBehaviour}
                behaviour={{
                    uri: 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Test.svg',
                }}
            />
        );
        expect(screen.getByTestId('image-upload')).toBeInTheDocument();
        expect(screen.getByTestId('image-delete')).toBeEnabled();
        expect(screen.getByTestId('icon-image')).toBeInTheDocument();
    });

    it('can delete a behaviour', async () => {
        const setBehaviour = jest.fn();
        const user = userEvent.setup();

        render(
            <ImageBehaviour
                setBehaviour={setBehaviour}
                behaviour={{
                    uri: 'https://upload.wikimedia.org/wikipedia/commons/b/bd/Test.svg',
                }}
            />
        );

        await user.click(screen.getByTestId('image-delete'));
        expect(setBehaviour).toHaveBeenCalledWith(undefined);
    });
});
