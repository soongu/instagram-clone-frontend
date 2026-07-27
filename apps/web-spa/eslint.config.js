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
  {
    // 일반 변수로는 화면이 안 바뀐다는 것을 보여주려고 일부러 규칙을 어긴 파일이다.
    // 학생이 따라 칠 때는 이 경고가 그대로 떠야 하므로 파일 안에 disable 주석을 넣지 않는다.
    files: ['src/components/ClickCounter.tsx'],
    rules: {
      'react-hooks/immutability': 'off',
    },
  },
  {
    // 훅 규칙을 어긴 컴포넌트가 실행 중에 어떻게 무너지는지 확인하려고 남긴 파일이다.
    // 린트가 먼저 막아버리면 실행까지 갈 수가 없어서 여기서만 규칙을 끈다.
    files: ['scratch/b3-hook-runtime.tsx'],
    rules: {
      'react-hooks/rules-of-hooks': 'off',
    },
  },
);
