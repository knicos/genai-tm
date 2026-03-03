import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import react from 'eslint-plugin-react';
import tseslint from 'typescript-eslint';
import topLevelFunction from './eslint-rules/top-level-function.js';

export default tseslint.config(
    { ignores: ['dist'] },
    {
        extends: [
            js.configs.recommended,
            ...tseslint.configs.recommended,
            ...tseslint.configs.strict,
            ...tseslint.configs.stylistic,
        ],
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            ecmaVersion: 2020,
        },
        plugins: {
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
            react,
            local: topLevelFunction,
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            ...react.configs.flat.rules,
            'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
            'local/top-level-function-declaration': 'error',
            // React best practices
            'react/jsx-key': 'error',
            'react/jsx-no-useless-fragment': 'error',
            'react/no-array-index-key': 'warn',
            'react/jsx-no-script-url': 'error',
            'react/jsx-no-target-blank': 'error',
            'react/jsx-no-comment-textnodes': 'error',
            '@typescript-eslint/no-empty-function': 'off',
            'react-hooks/refs': 'off',
            'react-hooks/immutability': 'off',
            'react-hooks/set-state-in-effect': 'warn',
        },
    }
);
