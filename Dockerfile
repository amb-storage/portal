FROM node:24.22.1-alpine AS build
WORKDIR /app
# Corepack đi kèm Node 24 chưa chạy được pnpm 12 → cài thẳng đúng bản trong "packageManager"
RUN npm install --global --no-fund --no-audit pnpm@12.4.1
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
# Rỗng = gọi API cùng domain qua proxy /api của Caddy (giống Vite proxy lúc dev)
ARG VITE_API_BASE_URL=
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN pnpm build

FROM caddy:2.10.2-alpine AS runtime
COPY deploy/Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv
# Chạy không cần root; cổng 8080 chỉ mở trong mạng Docker
USER 1000:1000
ENV XDG_DATA_HOME=/tmp/caddy-data XDG_CONFIG_HOME=/tmp/caddy-config
EXPOSE 8080
HEALTHCHECK --interval=10s --timeout=5s --start-period=10s --retries=6 \
  CMD wget -qO- http://127.0.0.1:8080/healthz >/dev/null || exit 1
