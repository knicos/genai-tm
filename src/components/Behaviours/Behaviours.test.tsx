import React from 'react';
import { render, screen } from '@testing-library/react';
import Behaviours from './Behaviours';
import TestWrapper from '../../util/TestWrapper';

describe('Behaviours component', () => {
    it('renders with one behaviour', async () => {
        const setBehaviour = jest.fn();
        // classes={['c1']}
        // behaviours={[{ label: 'c1', text: { text: 'Test Message' } }]}
        // setBehaviours={setBehaviour}
        render(<Behaviours />, { wrapper: TestWrapper });
        expect(screen.getByText('behaviours.labels.title')).toBeInTheDocument();
    });
});
