import js from '@eslint/js';
import globals from 'globals';

export default [
    {
        ignores: [
            'vendor/**',
            'node_modules/**',
            'public/build/**',
            'storage/**',
            'bootstrap/ssr/**',
        ],
    },
    js.configs.recommended,
    {
        files: ['resources/js/**/*.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: globals.browser,
        },
    },
    {
        files: ['vite.config.js', 'eslint.config.js'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: globals.node,
        },
    },
    {
        files: ['resources/js/**/*.js', 'vite.config.js', 'eslint.config.js'],
        rules: {
            eqeqeq: ['error', 'always'],
        },
    },
];
