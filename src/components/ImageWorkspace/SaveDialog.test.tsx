import React from 'react';
import { act, render, screen, within } from '@testing-library/react';
import SaveDialog from './SaveDialog';
import userEvent from '@testing-library/user-event';

describe('SaveDialog component', () => {
    it('renders open', async () => {
        const trigger = jest.fn();
        const onsave = jest.fn();
        render(
            <SaveDialog
                trigger={trigger}
                onSave={onsave}
                hasModel={true}
            />
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
                hasModel={true}
            />
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
                hasModel={true}
            />
        );

        const save = screen.getByTestId('save-save');
        await user.click(save);
        expect(trigger).toHaveBeenCalledTimes(1);
        expect(onsave).toHaveBeenCalledWith({ samples: false, model: true, behaviours: true });
    });
});
