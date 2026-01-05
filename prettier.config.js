/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
    printWidth: 120,
    tabWidth: 4,
    trailingComma: 'all',
    semi: true,
    jsxSingleQuote: true,
    singleQuote: true,
    quoteProps: 'consistent',
    plugins: [],
    overrides: [
        {
            files: '*.astro',
            options: {
                parser: 'astro',
            },
        },
    ],
};

export default config;
