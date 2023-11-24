import { describe, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import WebcamCapture from './WebcamCapture';
import userEvent from '@testing-library/user-event';
import TestWrapper from '../../util/TestWrapper';

describe('WebcamCapture component', () => {
    it('opens and closes', async ({ expect }) => {
        const user = userEvent.setup();
        const onClose = vi.fn();
        const onCapture = vi.fn();
        render(
            <WebcamCapture
                visible={true}
                onClose={onClose}
                onCapture={onCapture}
            />,
            { wrapper: TestWrapper }
        );
        expect(screen.getByTestId('webcamwindow')).toBeInTheDocument();
        expect(onClose).toHaveBeenCalledTimes(0);
        const buttonElement = screen.getByTestId('webcamclose');
        await user.click(buttonElement);
        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
