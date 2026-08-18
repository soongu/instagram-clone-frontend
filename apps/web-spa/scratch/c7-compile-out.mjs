// apps/web-spa/scratch/c7-compile-out.mjs
// 파일 하나를 React Compiler 로 돌려 결과 코드를 그대로 찍는다.
//   node scratch/c7-compile-out.mjs src/components/LikeButton.tsx
//   node scratch/c7-compile-out.mjs --summary src/components/*.tsx
import { readFileSync } from 'node:fs';
import { transformAsync } from '@babel/core';
import { reactCompilerPreset } from '@vitejs/plugin-react';

const args = process.argv.slice(2);
const summary = args[0] === '--summary';
const files = summary ? args.slice(1) : args;

async function compile(file) {
  const source = readFileSync(file, 'utf8');
  const out = await transformAsync(source, {
    filename: file,
    presets: [reactCompilerPreset().preset],
    parserOpts: { plugins: ['jsx', 'typescript'] },
    configFile: false,
    babelrc: false,
  });
  return out.code;
}

for (const file of files) {
  const code = await compile(file);

  if (summary) {
    // _c(N) 가 하나도 없으면 컴파일러가 그 파일을 통째로 건너뛴 것이다
    const caches = [...code.matchAll(/_c\((\d+)\)/g)].map((m) => Number(m[1]));
    const label = caches.length === 0 ? '건너뜀' : `캐시 ${caches.join(', ')}칸`;
    console.log(`${label.padEnd(20)} ${file}`);
  } else {
    console.log(code);
  }
}
