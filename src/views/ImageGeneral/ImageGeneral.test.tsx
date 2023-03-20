import React from 'react';
import { render, screen } from '@testing-library/react';
import { Component } from './ImageGeneral';
import {BrowserRouter} from 'react-router-dom'

test('renders learn react link', () => {
  render(<Component />, {wrapper: BrowserRouter});
  const linkElement = screen.getByText(/training.actions.train/i);
  expect(linkElement).toBeInTheDocument();
});
