/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
    plugins: [react()],
    build: {
        rollupOptions: {
            output: {
                inlineDynamicImports: mode === 'robot',
            },
        },
    },
    test: {
        environment: 'jsdom',
        setupFiles: './src/setupTests.ts',
        clearMocks: true,
        coverage: {
            provider: 'v8',
            reporter: ['cobertura', 'html'],
        },
        server: {
            deps: {
                inline: ['@genai-fi/base'],
            },
        },
    },
    resolve: {
        alias: {
            '@genaitm': path.resolve(__dirname, './src'),
        },
    },
}));
