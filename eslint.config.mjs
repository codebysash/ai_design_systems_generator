import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
})

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'prettier'),
  {
    rules: {
      'prefer-const': 'error',
      'no-var': 'error',
      'no-unused-vars': 'warn',
    },
  },
]

export default eslintConfig