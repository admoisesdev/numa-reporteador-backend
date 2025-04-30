FROM node:20-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY . .
RUN pnpm install --frozen-lockfile && \
    npx prisma generate && \
    pnpm run build

ENV FRONTEND_URL=http://34.71.107.222
ENV DATABASE_URL=postgresql://postgres:admin123@34.71.107.222:5433/numadb?schema=public&connection_limit=20&pool_timeout=5
ENV JWT_SECRET=3x@mpl3$3cur3JWTs3cr3t!1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ
ENV PORT=3000

EXPOSE 3000

CMD ["pnpm", "start:prod"]