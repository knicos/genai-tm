import { it } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

it('renders app', async ({ expect }) => {
    render(<App />);
    expect(screen.getByTestId('versionlink')).toBeInTheDocument();
});
