// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/vitest';
// import crypto from 'crypto';
import mockReact from 'react';
import { vi, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// global.crypto = crypto.webcrypto as Crypto;

class BC {
    onmessage: ((ev: MessageEvent<any>) => any) | null = null;
    postMessage = vi.fn();
    close = vi.fn();
    onmessageerror: ((ev: MessageEvent<any>) => any) | null = null;
    name = 'noname';
    addEventListener = vi.fn();
    removeEventListener = vi.fn();
    dispatchEvent = vi.fn();
}

global.BroadcastChannel = BC;

vi.mock('react-dnd', () => ({
    useDrop: () => [{}, mockReact.createRef()],
    DndProvider: ({ children }: { children: unknown }) => children,
}));
vi.mock('react-dnd-html5-backend', () => ({
    NativeTypes: {
        FILE: Symbol(0),
        URL: Symbol(1),
    },
    HTML5Backend: vi.fn(),
}));

class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
}

global.ResizeObserver = ResizeObserver;

// runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
    cleanup();
});
