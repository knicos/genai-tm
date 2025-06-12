import { it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Component } from './ImageGeneral';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Provider } from 'jotai';

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
