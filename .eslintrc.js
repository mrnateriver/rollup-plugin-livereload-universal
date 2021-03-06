module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
    },
    env: {
        es6: true,
        jest: true,
        browser: true,
        node: true,
    },
    plugins: [
        'jest',
        '@typescript-eslint', // Plugin for linting TypeScript using ESLint
    ],
    extends: [
        'eslint:recommended',
        'plugin:jest/recommended',
        'plugin:@typescript-eslint/recommended', // Recommended settings for TypeScript linting
        'prettier/@typescript-eslint', // Rules for validating formatting of TypeScript code
        'plugin:prettier/recommended', // Recommended general formatting rules
    ],
    rules: {
        // This configuration is intended for applications, rather than libraries, so IDE is implied which can infer and display return types
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        'jest/no-test-callback': 'off',
    },
};
