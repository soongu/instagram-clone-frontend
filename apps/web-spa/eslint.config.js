// apps/web-spa/eslint.config.js
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist'] },
  js.configs.recommended,
  tseslint.configs.recommended,
  reactHooks.configs.flat.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2025,
      globals: globals.browser,
    },
    rules: {
      // 밑줄로 시작하는 이름은 "일부러 안 쓴다"는 표시로 인정한다
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
    },
  },
  {
    // A 카테고리의 타입 실습 파일은 let/const 추론 차이를 일부러 보여준다
    files: ['src/types/**/*.ts'],
    rules: {
      'prefer-const': 'off',
    },
  },
);
