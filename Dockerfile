# --- Etapa de construcción ---
FROM node:20-alpine AS builder

WORKDIR /app

# 1. Configura pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 2. Copia archivos de dependencias
COPY package.json pnpm-lock.yaml ./
COPY . .

# 3. Instala TODAS las dependencias (incluyendo devDependencies)
RUN pnpm install --frozen-lockfile

# 4. Genera el build de producción
RUN pnpm run build

# --- Etapa de producción ---
FROM node:20-alpine

WORKDIR /app

# 1. Configura pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 2. Copia solo lo necesario
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile
COPY --from=builder /app/dist ./dist

# 3. Variables de entorno
ENV FRONTEND_URL=http://34.71.107.222
ENV DATABASE_URL=postgresql://postgres:admin123@postgres:5432/numadb?schema=public
ENV PORT=3000

EXPOSE 3000

CMD ["pnpm", "start:prod"]