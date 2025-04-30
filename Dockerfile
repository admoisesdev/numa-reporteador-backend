FROM node:20-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY . .
RUN pnpm install --frozen-lockfile && \
    npx prisma generate && \
    pnpm run build

ARG FRONTEND_URL
ENV FRONTEND_URL=$FRONTEND_URL

ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL

ARG JWT_SECRET
ENV JWT_SECRET=$JWT_SECRET

ARG PORT
ENV PORT=$PORT

EXPOSE 3000

CMD ["pnpm", "start:prod"]