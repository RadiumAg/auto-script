module.exports = {
  extends: 'erb',
  rules: {
    // A temporary hack related to IDE not resolving correct package.json
    'import/no-extraneous-dependencies': 'off',
    // Since React 17 and typescript 4.1 you can safely disable the rule
    'react/react-in-jsx-scope': 'off',
    'no-await-in-loop': 'off',
    'import/no-unresolved': 'off',
    'jsx-a11y/click-events-have-key-events': 'off',
    'no-use-before-define': 'off',
    'import/prefer-default-export': 'off',
    'no-console': 'off',
    'no-shadow': 'off',
    'no-restricted-syntax': 'off',
    'import/extensions': 'off',
    'react/jsx-filename-extension': 'off',
    'no-continue': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    'no-plusplus': 'off',
    '@typescript-eslint/no-shadow': 'off',
    'no-else-return': 'off',
    'no-explicit-any': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        endOfLine: 'auto',
        trailingComma: 'all',
        arrowParens: 'avoid',
      },
    ],
  },
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    createDefaultProgram: true,
  },
  settings: {
    'import/resolver': {
      // See https://github.com/benmosher/eslint-plugin-import/issues/1396#issuecomment-575727774 for line below
      node: {},
      webpack: {
        config: require.resolve('./.erb/configs/webpack.config.eslint.ts'),
      },
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
  },
};
