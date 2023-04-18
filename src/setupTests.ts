// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import crypto from 'crypto';

global.crypto = crypto.webcrypto as Crypto;

class BC {
    onmessage: ((ev: MessageEvent<any>) => any) | null = null;
    postMessage = jest.fn();
    close = jest.fn();
    onmessageerror: ((ev: MessageEvent<any>) => any) | null = null;
    name = 'noname';
    addEventListener = jest.fn();
    removeEventListener = jest.fn();
    dispatchEvent = jest.fn();
}

global.BroadcastChannel = BC;

jest.mock('react-dnd', () => ({
    useDrop: () => [{}, {}],
    DndProvider: ({ children }: { children: unknown }) => children,
}));
jest.mock('react-dnd-html5-backend', () => ({
    NativeTypes: {
        FILE: Symbol(0),
        URL: Symbol(1),
    },
    HTML5Backend: jest.fn(),
}));

class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
}

global.ResizeObserver = ResizeObserver;
