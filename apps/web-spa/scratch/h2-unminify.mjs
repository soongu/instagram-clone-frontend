// 배포본의 한 자리를 지도로 되돌려본다. 의존성 0 — node 에 들어 있는 것만 쓴다.
//
//   node scratch/h2-unminify.mjs <배포본파일> <줄> <칸>
//   예) node scratch/h2-unminify.mjs dist/assets/index-B0C2AadU.js 38 49029
//
// 인자를 안 주면 오류 화면 글자가 있는 자리를 스스로 찾아서 되돌린다.
import { SourceMap } from 'node:module';
import { readFileSync, readdirSync } from 'node:fs';

const [fileArg, lineArg, colArg] = process.argv.slice(2);

const file =
  fileArg ??
  'dist/assets/' + readdirSync('dist/assets').find((f) => f.startsWith('index-') && f.endsWith('.js'));

const source = readFileSync(file, 'utf8');
const map = JSON.parse(readFileSync(file + '.map', 'utf8'));
const sourceMap = new SourceMap(map);

let line, column;
if (lineArg && colArg) {
  line = Number(lineArg) - 1;
  column = Number(colArg) - 1;
} else {
  const lines = source.split('\n');
  for (let i = 0; i < lines.length; i += 1) {
    const c = lines[i].indexOf('문제가 생겼어요');
    if (c >= 0) {
      line = i;
      column = c;
      break;
    }
  }
}

const entry = sourceMap.findEntry(line, column);

console.log(`배포본  : ${file}:${line + 1}:${column + 1}`);
console.log(`되돌리면: ${entry.originalSource} : ${entry.originalLine + 1}행 ${entry.originalColumn + 1}칸`);

const index = map.sources.findIndex((s) => entry.originalSource.endsWith(s.replace('../../', '')));
if (index >= 0) {
  console.log(`그 줄   : ${map.sourcesContent[index].split('\n')[entry.originalLine]}`);
}
