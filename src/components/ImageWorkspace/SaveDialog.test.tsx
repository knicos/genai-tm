import React from 'react';
import { render, screen } from '@testing-library/react';
import SaveDialog from './SaveDialog';
import userEvent from '@testing-library/user-event';
import TestWrapper from '../../util/TestWrapper';

jest.mock('../../util/TeachableModel', () => ({
    useTeachableModel: function () {
        return { hasModel: true };
    },
}));

describe('SaveDialog component', () => {
    it('renders open', async () => {
        const trigger = jest.fn();
        const onsave = jest.fn();
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

    it('can be canceled', async () => {
        const user = userEvent.setup();
        const trigger = jest.fn();
        const onsave = jest.fn();
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

    it('can generate a save request', async () => {
        const user = userEvent.setup();
        const trigger = jest.fn();
        const onsave = jest.fn();
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
        expect(onsave).toHaveBeenCalledWith({ samples: true, model: true, behaviours: true });
    });
});
