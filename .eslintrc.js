module.exports = {
    extends: 'airbnb-base',
    rules: {
        indent: [2, 4],
        'consistent-return': 0, // allow function with no return statement
        'global-require': 1, // allow using the require statement inside nested closures
        'arrow-parens': 0, // allow using of a single argument with no parentheses
        'max-len': ['error', { code: 140 }],
        'no-restricted-syntax': [ // allow using for-of and for-in loops
            'off',
            { selector: 'ForInStatement' },
            { selector: 'ForOfStatement' },
        ],
        'object-curly-newline': 0,
        'jest/no-disabled-tests': 'warn',
        'jest/no-focused-tests': 'error',
        'jest/no-identical-title': 'error',
        'jest/prefer-to-have-length': 'warn',
        'jest/valid-expect': 'error',
    },
    plugins: ['jest'],
    env: {
        'jest/globals': true,
    },
};
