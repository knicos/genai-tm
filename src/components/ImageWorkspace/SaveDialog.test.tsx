import { describe, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SaveDialog from './SaveDialog';
import userEvent from '@testing-library/user-event';
import TestWrapper from '../../util/TestWrapper';

vi.mock('../../util/TeachableModel', () => ({
    useTeachableModel: function () {
        return { hasModel: true };
    },
}));

describe('SaveDialog component', () => {
    it('renders open', async ({ expect }) => {
        const trigger = vi.fn();
        const onsave = vi.fn();
        render(
            <SaveDialog
                trigger={trigger}
                onSave={onsave}
            />,
            { wrapper: TestWrapper }
        );

        expect(screen.getByText('save.message')).toBeInTheDocument();
        expect(screen.getByTestId('check-save-behaviours')).toBeInTheDocument();
    });

    it('can be canceled', async ({ expect }) => {
        const user = userEvent.setup();
        const trigger = vi.fn();
        const onsave = vi.fn();
        render(
            <SaveDialog
                trigger={trigger}
                onSave={onsave}
            />,
            { wrapper: TestWrapper }
        );

        const cancel = screen.getByTestId('save-cancel');
        await user.click(cancel);
        expect(trigger).toHaveBeenCalledTimes(1);
    });

    it('can generate a save request', async ({ expect }) => {
        const user = userEvent.setup();
        const trigger = vi.fn();
        const onsave = vi.fn();
        render(
            <SaveDialog
                trigger={trigger}
                onSave={onsave}
            />,
            { wrapper: TestWrapper }
        );

        const save = screen.getByTestId('save-save');
        await user.click(save);
        expect(trigger).toHaveBeenCalledTimes(1);
        expect(onsave).toHaveBeenCalledWith({ samples: true, model: true, behaviours: true, name: 'My Model' });
    });
});
