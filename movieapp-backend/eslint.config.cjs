// eslint.config.cjs
module.exports = [
  {
    languageOptions: {
      parserOptions: {
        ecmaVersion: 2020,  // ECMAScript version
        sourceType: 'module',  // Module system
      },
      globals: {
        __dirname: 'readonly',  // Add global variables as needed
        process: 'readonly',  // For Node.js environment
      },
    },
    rules: {
      // Rules from eslint:recommended
      'no-console': 'warn',
      'no-debugger': 'warn',
      'no-unused-vars': ['warn', { 'argsIgnorePattern': '^_' }],
      // Add other rules as needed
    },
  },
];
