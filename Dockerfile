FROM node:20-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY . .
RUN pnpm install --frozen-lockfile && \
    npx prisma generate && \
    pnpm run build

ENV FRONTEND_URL=http://34.71.107.222
ENV DATABASE_URL=postgresql://postgres:admin123@34.71.107.222/numadb?schema=public
ENV PORT=3000

EXPOSE 3000

CMD ["pnpm", "start:prod"]