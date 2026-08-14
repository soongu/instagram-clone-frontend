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
    // ref 에 담은 값이 화면에 안 나온다는 것을 눈으로 보여주려고 일부러 렌더 중에 읽는다.
    // 학생이 따라 칠 때는 이 에러가 그대로 떠야 하므로 파일 안에 disable 주석을 넣지 않는다.
    files: ['src/components/RefVsStateDemo.tsx'],
    rules: {
      'react-hooks/refs': 'off',
    },
  },
  {
    // 훅 규칙을 어긴 컴포넌트가 실행 중에 어떻게 무너지는지 확인하려고 남긴 파일이다.
    // 린트가 먼저 막아버리면 실행까지 갈 수가 없어서 여기서만 규칙을 끈다.
    files: ['scratch/b3-hook-runtime.tsx', 'scratch/b3-assignment-runtime.tsx'],
    rules: {
      'react-hooks/rules-of-hooks': 'off',
    },
  },
  {
    // 누가 몇 번 다시 그려지는지 세는 판이다. 세려면 렌더 중에 바깥 값을 건드려야 하는데
    // 그게 정확히 이 규칙이 막는 것이다 — 재는 행위 자체가 규칙 위반이라 여기서만 끈다.
    files: ['src/contexts/c3-rerender-scope.test.tsx'],
    rules: {
      'react-hooks/immutability': 'off',
    },
  },
  {
    // use 와 useContext 를 같은 조건 안에 나란히 두고 무엇이 갈리는지 보여주는 판이다.
    // 규칙에 걸리는 쪽을 지우면 비교 자체가 사라지므로 여기서만 끈다.
    // 학생이 따라 칠 때는 (b)·(c) 에서 이 에러가 그대로 떠야 한다.
    files: ['src/components/ConditionalContextDemo.tsx'],
    rules: {
      'react-hooks/rules-of-hooks': 'off',
    },
  },
  {
    // use 와 useContext 를 같은 조건 안에 나란히 두고 린트가 무엇만 잡는지 보려는 파일이다.
    // 규칙이 걸리는 쪽을 지우면 비교 자체가 사라지므로 여기서만 끈다.
    files: ['scratch/c3-probe-use-conditional.tsx'],
    rules: {
      'react-hooks/rules-of-hooks': 'off',
    },
  },
  {
    // effect 로 상태를 맞추면 실행 중에 무슨 일이 생기는지 확인하려고 남긴 파일이다.
    // 린트가 먼저 막아버리면 실행까지 갈 수가 없어서 여기서만 규칙을 끈다.
    files: ['scratch/b4-unnecessary-effects-runtime.tsx'],
    rules: {
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  {
    // 의존성을 일부러 비웠을 때 값이 어떻게 낡는지 확인하려고 남긴 파일이다.
    // 학생이 따라 할 때는 이 경고가 그대로 떠야 하므로 파일 안 주석으로 끄지 않는다.
    files: ['src/components/b4-answer.test.tsx'],
    rules: {
      'react-hooks/exhaustive-deps': 'off',
    },
  },
);
