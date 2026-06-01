FROM node:24-alpine AS build

WORKDIR /app

RUN corepack enable
RUN corepack prepare pnpm@10.33.2 --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build

EXPOSE 3000
CMD ["pnpm", "exec", "next", "start", "-H", "0.0.0.0"]