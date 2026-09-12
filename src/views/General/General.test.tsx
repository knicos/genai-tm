import { it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Component } from './General';
import { MemoryRouter, Route, Routes } from 'react-router';
import { Provider } from 'jotai';

vi.mock('../../state', async (importOriginal) => {
    const original = await importOriginal<typeof import('../../state')>();
    const { atom } = await import('jotai');

    return {
        ...original,
        featureFlagsAtom: atom({ allowReportProblem: false, allowTransferLearning: true }),
    };
});

it('renders general view', async ({ expect }) => {
    render(
        <MemoryRouter initialEntries={['/image/general']}>
            <Provider>
                <Routes>
                    <Route
                        path=":kind/:variant"
                        element={<Component />}
                    />
                </Routes>
            </Provider>
        </MemoryRouter>
    );
    await waitFor(() => {
        const linkElement = screen.getByText(/training.actions.train/i);
        expect(linkElement).toBeInTheDocument();
    });
});
