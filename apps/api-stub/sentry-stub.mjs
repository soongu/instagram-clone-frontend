// apps/api-stub/sentry-stub.mjs
//
// 오류를 받아주는 연습용 서비스.
//
// 진짜 오류 추적 서비스는 우리 API 서버와 다른 회사가 다른 주소에서 운영한다.
// 그래서 이 파일도 server.mjs 와 따로 있고 포트도 다르다.
//
//   node apps/api-stub/sentry-stub.mjs
//
// 브라우저 SDK 는 DSN 의 주소로 봉투(envelope)를 POST 한다.
// DSN 이 http://아무키나@localhost:9000/7 이면 보내는 곳은
//
//   POST /api/7/envelope/
//
// 이다. 공개 키는 서버에 확인하지 않으므로 아무 글자나 써도 도착한다.
import { createServer } from 'node:http';

const PORT = Number(process.env.SENTRY_STUB_PORT ?? 9000);

/** 받은 봉투를 최근 것부터 쌓아둔다. GET /envelopes 로 들여다볼 수 있다. */
const envelopes = [];
const KEEP = 50;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

function readRawBody(req) {
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => resolve(raw));
  });
}

/**
 * 봉투는 JSON 이 아니라 줄바꿈으로 나뉜 JSON 여러 개(NDJSON)다.
 * 첫 줄이 봉투 머리, 그다음부터 [항목 머리, 항목 내용] 이 짝으로 이어진다.
 */
function parseEnvelope(raw) {
  const lines = raw.split('\n').filter((line) => line !== '');
  const parsed = lines.map((line) => {
    try {
      return JSON.parse(line);
    } catch {
      return null;
    }
  });
  return { header: parsed[0] ?? null, items: parsed.slice(1) };
}

/** 사람이 읽을 한 줄로 줄인다. */
function summarize(envelope) {
  const exception = envelope.items.find((item) => item?.exception)?.exception;
  const value = exception?.values?.[0];
  if (value === undefined) {
    const type = envelope.items.find((item) => item?.type)?.type ?? '알 수 없음';
    return `${type}`;
  }
  const frames = value.stacktrace?.frames ?? [];
  const top = frames[frames.length - 1];
  const where =
    top === undefined
      ? '(스택 없음)'
      : `${top.filename ?? '?'}:${top.lineno ?? '?'}:${top.colno ?? '?'}`;
  return `${value.type}: ${value.value}  ← ${where}`;
}

const server = createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS);
    return res.end();
  }

  const path = (req.url ?? '').split('?')[0];

  // 우리가 받아둔 것을 다시 꺼내 보는 자리. 진짜 서비스의 대시보드에 해당한다.
  if (req.method === 'GET' && path === '/envelopes') {
    const text = JSON.stringify(envelopes, null, 2);
    res.writeHead(200, {
      ...CORS,
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': Buffer.byteLength(text),
    });
    return res.end(text);
  }

  // SDK 가 보내는 곳. /api/{프로젝트번호}/envelope/
  if (req.method === 'POST' && /^\/api\/[^/]+\/envelope\/?$/.test(path)) {
    const raw = await readRawBody(req);
    const parsed = parseEnvelope(raw);
    const record = {
      receivedAt: new Date().toISOString(),
      bytes: Buffer.byteLength(raw),
      eventId: parsed.header?.event_id ?? null,
      summary: summarize(parsed),
      raw,
    };

    envelopes.unshift(record);
    if (envelopes.length > KEEP) {
      envelopes.length = KEEP;
    }

    console.log(
      `[오류받음] ${record.bytes.toLocaleString()} B · ${record.eventId ?? '(id 없음)'}\n` +
        `          ${record.summary}`,
    );

    res.writeHead(200, { ...CORS, 'Content-Type': 'application/json' });
    return res.end('{}');
  }

  res.writeHead(404, { ...CORS, 'Content-Type': 'application/json' });
  res.end('{}');
});

server.listen(PORT, () => {
  console.log(`오류 받는 연습용 서비스가 http://localhost:${PORT} 에서 기다리고 있어요.`);
  console.log(`받은 것을 다시 보려면 http://localhost:${PORT}/envelopes`);
});
