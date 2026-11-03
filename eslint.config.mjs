import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['node_modules/**', 'reports/**', 'web/.auth/**'] },
  js.configs.recommended,
  tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "CallExpression[callee.object.name='test'][callee.property.name='only']",
          message: 'Focused tests must not be committed.',
        },
        {
          selector:
            "CallExpression[callee.object.object.name='test'][callee.property.name='only']",
          message: 'Focused test groups must not be committed.',
        },
      ],
    },
  },
  {
    files: ['web/tests/**/*.spec.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: '@playwright/test',
              message:
                'Import test and expect from web/fixtures/pom/test-options.ts.',
            },
          ],
        },
      ],
    },
  },
);
