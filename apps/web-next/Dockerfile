# apps/web-next/Dockerfile

# 1단계 — 설치. 여기서만 npm 을 쓴다.
FROM node:24-alpine AS deps
WORKDIR /repo
COPY package.json package-lock.json ./
COPY apps/web-next/package.json apps/web-next/
RUN npm ci --workspace web-next --include-workspace-root

# 2단계 — 빌드. 소스를 넣고 next build 를 돌린다.
FROM node:24-alpine AS builder
WORKDIR /repo
COPY --from=deps /repo/node_modules ./node_modules
COPY . .
WORKDIR /repo/apps/web-next
RUN npx next build

# 3단계 — 실행. 앞 두 단계에서 만든 결과만 가져온다. 소스도 개발 도구도 안 따라온다.
FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /repo/apps/web-next/.next/standalone ./
COPY --from=builder /repo/apps/web-next/.next/static ./apps/web-next/.next/static
EXPOSE 3000
CMD ["node", "apps/web-next/server.js"]
