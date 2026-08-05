const tseslint = require('typescript-eslint')

module.exports = tseslint.config(
  {
    ignores: ['dist/**', 'eslint.config.js', 'jest.config.cjs'],
  },
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['./test/tsconfig.json'],
      },
    },
    rules: {
      // TODO: Review lint
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
    },
  }
)
