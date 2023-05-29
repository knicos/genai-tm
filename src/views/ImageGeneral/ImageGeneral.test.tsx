import React from 'react';
import { render, screen } from '@testing-library/react';
import { Component } from './ImageGeneral';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { RecoilRoot } from 'recoil';

test('renders general view', () => {
    render(
        <MemoryRouter initialEntries={['/image/general']}>
            <RecoilRoot>
                <Routes>
                    <Route
                        path=":kind/:variant"
                        element={<Component />}
                    />
                </Routes>
            </RecoilRoot>
        </MemoryRouter>
    );
    const linkElement = screen.getByText(/training.actions.train/i);
    expect(linkElement).toBeInTheDocument();
});
