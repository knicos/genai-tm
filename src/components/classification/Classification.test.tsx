import React from "react";
import { render, screen } from '@testing-library/react';
import { Classification } from './Classification';

describe("Classification component", () => {
    it('renders with no samples and inactive', async () => {
        render(<Classification
            name="TestClass"
            active={false}
            data={{label: "TestClass", samples: []}}
            setData={() => {}}
            setActive={() => {}}
            onDelete={() => {}} />);
        expect(screen.getByTestId("widget-TestClass")).toBeInTheDocument();
        expect(screen.getByTestId("uploadbutton")).toBeInTheDocument();
    });
});
