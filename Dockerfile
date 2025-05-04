FROM node:20-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY . .
RUN pnpm install --frozen-lockfile && \
    npx prisma generate && \
    pnpm run build

EXPOSE 3000

CMD ["pnpm", "start:prod"]