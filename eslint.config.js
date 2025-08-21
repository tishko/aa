import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import importPlugin from 'eslint-plugin-import'
import unicorn from 'eslint-plugin-unicorn'
import vue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default [
  {
    ignores: ['dist', 'node_modules', 'coverage', '***.{js,cjs,mjs}'],
    languageOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    plugins: { import: importPlugin, unicorn },
    rules: {
      ...js.configs.recommended.rules,
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index']],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'unicorn/prefer-query-selector': 'error',
      'unicorn/prefer-modern-dom-apis': 'error',
    },
  },

  ...vue.configs['flat/recommended'],

  // ✅ Typed rules for app/test TypeScript (TS parser, uses tsconfig.eslint.json)
  {
    files: ['src*.ts', 'tests*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        sourceType: 'module',
        ecmaVersion: 'latest',
        project: ['./tsconfig.eslint.json'],
        tsconfigRootDir: __dirname,
      },
    },
    plugins: { '@typescript-eslint': tseslint.plugin, import: importPlugin, unicorn },
    settings: { 'import/resolver': { typescript: { project: './tsconfig.eslint.json' } } },
    rules: {
      ...tseslint.configs.recommendedTypeChecked[0].rules,
      ...tseslint.configs.stylisticTypeChecked[0].rules,
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index']],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/no-unresolved': 'error',
      'unicorn/prefer-query-selector': 'error',
      'unicorn/prefer-modern-dom-apis': 'error',
    },
  },

  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vue.parser,
      parserOptions: {
        parser: tseslint.parser, // still parses <script lang="ts">
        sourceType: 'module',
        ecmaVersion: 'latest',
        extraFileExtensions: ['.vue'],
      },
    },
    plugins: { '@typescript-eslint': tseslint.plugin, import: importPlugin, unicorn },
    settings: { 'import/resolver': { typescript: { project: './tsconfig.eslint.json' } } },
    rules: {
      ...tseslint.configs.recommended.rules,
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index']],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'unicorn/prefer-query-selector': 'error',
      'unicorn/prefer-modern-dom-apis': 'error',

      'unicorn/filename-case': ['error', { cases: { kebabCase: true, pascalCase: true } }],

      'vue/multi-word-component-names': 'off',
    },
  },

  {
    files: ['*.config.ts', '*.config.mts', 'vite.config.ts', 'vitest.config.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { sourceType: 'module', ecmaVersion: 'latest' }, // no "project"
    },
    plugins: { '@typescript-eslint': tseslint.plugin, import: importPlugin, unicorn },
    rules: {
      ...tseslint.configs.recommended.rules,
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index']],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'unicorn/prefer-query-selector': 'error',
      'unicorn/prefer-modern-dom-apis': 'error',
    },
  },

  prettier,
]
