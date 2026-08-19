D-10「밖으로 내보냅니다」계획 단계에서 실제로 만들어 검증한 산출물.
D-9 코드에는 안 들어간다 — D-10 착수 시 여기서 꺼내 쓴다.

  Dockerfile     3단계(deps → builder → runner) · node:22-alpine
                 컨텍스트는 모노레포 뿌리 · 이미지 226MB · build exit 0 확인
  dockerignore   저장소 뿌리(.dockerignore)에 놓는다
  config.ts      lib/config.ts — API_BASE 를 밖에서 받게 한다
                 (api.ts·proxy.ts 두 곳에 박혀 있던 주소를 여기로 모은다)

검증 결과는 d9-observations.txt 7·8절 참조.
컨테이너 실행 확인:
  docker build -f apps/web-next/Dockerfile -t insta-next:d10 .
  docker run -d -p 3400:3000 -e API_BASE=http://host.docker.internal:8090/api insta-next:d10
  → / 200 · /minji 200(제목 @minji) · /zzzzz 404 · 로그아웃 /minji 307
