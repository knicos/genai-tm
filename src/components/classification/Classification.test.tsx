import React from 'react';
import { render, screen } from '@testing-library/react';
import { Classification } from './Classification';
import TestWrapper from '../../util/TestWrapper';

describe('Classification component', () => {
    it('renders with no samples and inactive', async () => {
        render(
            <Classification
                name="TestClass"
                index={0}
                active={false}
                data={{ label: 'TestClass', samples: [] }}
                setData={() => {}}
                setActive={() => {}}
                onActivate={() => {}}
                onDelete={() => {}}
            />,
            { wrapper: TestWrapper }
        );
        expect(screen.getByTestId('widget-TestClass')).toBeInTheDocument();
        expect(screen.getByTestId('webcambutton')).toBeInTheDocument();
    });
});
