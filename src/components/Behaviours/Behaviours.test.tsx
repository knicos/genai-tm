import React from 'react';
import { render, screen } from '@testing-library/react';
import Behaviours from './Behaviours';
import TestWrapper from '../../util/TestWrapper';

describe('Behaviours component', () => {
    it('renders without any classes', async () => {
        const setBehaviour = jest.fn();
        render(
            <Behaviours
                classes={[]}
                behaviours={[]}
                setBehaviours={setBehaviour}
            />,
            { wrapper: TestWrapper }
        );
        expect(screen.getByText('behaviours.labels.title')).toBeInTheDocument();
    });

    it('renders with more classes than behaviours', async () => {
        const setBehaviour = jest.fn();
        render(
            <Behaviours
                classes={['testclass1']}
                behaviours={[]}
                setBehaviours={setBehaviour}
            />,
            { wrapper: TestWrapper }
        );
        expect(setBehaviour).toHaveBeenCalledWith([{ image: expect.any(Object) }]);
    });

    it('renders with more behaviours than classes', async () => {
        const setBehaviour = jest.fn();
        render(
            <Behaviours
                classes={[]}
                behaviours={[{ text: { text: 'Test Message' } }]}
                setBehaviours={setBehaviour}
            />,
            { wrapper: TestWrapper }
        );
        expect(setBehaviour).toHaveBeenCalledWith([]);
    });
});
