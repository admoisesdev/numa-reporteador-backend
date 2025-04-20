# --- Etapa de construcción ---
FROM node:20-alpine AS builder

WORKDIR /app

# Instala pnpm y dependencias
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

# --- Etapa de producción ---
FROM node:20-alpine

WORKDIR /app

# Instala pnpm y solo production dependencies
RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/dist ./dist

# Variables de entorno para la conexión a PostgreSQL
ENV FRONTEND_URL=http://34.71.107.222
ENV DATABASE_URL=postgresql://postgres:admin123@postgres:5432/numadb?schema=public
ENV PORT=3000

EXPOSE 3000

CMD ["pnpm", "start:prod"]