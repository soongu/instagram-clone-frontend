# apps/web-next/Dockerfile
# 1단계 — 설치
FROM node:22-alpine AS deps
WORKDIR /repo
COPY package.json package-lock.json ./
COPY apps/web-next/package.json apps/web-next/
RUN npm ci --workspace web-next --include-workspace-root

# 2단계 — 빌드
FROM node:22-alpine AS builder
WORKDIR /repo
COPY --from=deps /repo/node_modules ./node_modules
COPY . .
WORKDIR /repo/apps/web-next
RUN npx next build

# 3단계 — 실행
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /repo/apps/web-next/.next/standalone ./
COPY --from=builder /repo/apps/web-next/.next/static ./apps/web-next/.next/static
EXPOSE 3000
CMD ["node", "apps/web-next/server.js"]
