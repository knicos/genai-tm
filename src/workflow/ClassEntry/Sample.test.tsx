import { describe, it } from 'vitest';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import Sample from './Sample';
import userEvent from '@testing-library/user-event';

function TestWrapper() {
    const iCanvas = document.createElement('canvas');
    iCanvas.setAttribute('data-testid', 'sample');
    const [image, setImage] = useState(iCanvas);

    return (
        <div>
            <Sample
                index={0}
                image={image}
                onDelete={() => {}}
            />
            <button
                data-testid="newimage"
                onClick={() => {
                    const nCanvas = document.createElement('canvas');
                    nCanvas.setAttribute('data-testid', 'sample');
                    setImage(nCanvas);
                }}
            >
                Click
            </button>
        </div>
    );
}

describe('Sample image component', () => {
    it('always shows a single canvas', async ({ expect }) => {
        const user = userEvent.setup();
        render(<TestWrapper />);
        expect(screen.getAllByTestId('sample')).toHaveLength(1);
        const buttonElement = screen.getByTestId('newimage');
        await user.click(buttonElement);
        expect(screen.getAllByTestId('sample')).toHaveLength(1);
    });
});
