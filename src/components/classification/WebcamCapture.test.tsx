import React from "react";
import { render, screen } from '@testing-library/react';
import WebcamCapture from './WebcamCapture';
import userEvent from "@testing-library/user-event";

describe("WebcamCapture component", () => {
    it('opens and closes', async () => {
        const user = userEvent.setup();
        const onClose = jest.fn();
        const onCapture = jest.fn();
        render(<WebcamCapture visible={true} onClose={onClose} onCapture={onCapture} />);
        expect(screen.getByTestId("webcamwindow")).toBeInTheDocument();
        expect(onClose).toHaveBeenCalledTimes(0);
        const buttonElement = screen.getByTestId("webcamclose");
        await user.click(buttonElement);
        expect(onClose).toHaveBeenCalledTimes(1);
    });
});