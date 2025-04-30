FROM node:20-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY . .
RUN pnpm install --frozen-lockfile && \
    npx prisma generate && \
    pnpm run build

ENV FRONTEND_URL=$FRONTEND_URL

ENV DATABASE_URL=$DATABASE_URL

ENV JWT_SECRET=$JWT_SECRET

ENV PORT=$PORT

EXPOSE 3000

CMD ["pnpm", "start:prod"]