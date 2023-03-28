import React from 'react';
import { render, screen } from '@testing-library/react';
import { Component } from './ImageGeneral';
import { BrowserRouter } from 'react-router-dom';
import { RecoilRoot } from 'recoil';

test('renders learn react link', () => {
    render(
        <RecoilRoot>
            <Component />
        </RecoilRoot>,
        { wrapper: BrowserRouter }
    );
    const linkElement = screen.getByText(/training.actions.train/i);
    expect(linkElement).toBeInTheDocument();
});
