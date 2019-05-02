module.exports = {
  env: {
    browser: true,
    es6: true,
  },
  extends: 'eslint:recommended',
  globals: {
    chrome: true,
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    'comma-dangle': [
      'error',
      {
        arrays: 'always-multiline',
        objects: 'always-multiline',
        imports: 'always-multiline',
        exports: 'always-multiline',
        functions: 'always-multiline',
      },
    ],
    'no-console': 'off',
    quotes: ['error', 'single'],
    semi: ['error', 'never'],
    'no-unused-vars': [
      'error',
      {
        vars: 'all',
        args: 'after-used',
        ignoreRestSiblings: true,
      },
    ],
  },
  plugins: ['jsdoc'],
}
