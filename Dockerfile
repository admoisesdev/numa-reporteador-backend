FROM node:20-alpine

WORKDIR /app

# 1. Configura pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 2. Copia solo los archivos necesarios para instalar dependencias
COPY package.json pnpm-lock.yaml ./

# 3. Instala SOLO dependencias de producción
RUN pnpm install --prod --frozen-lockfile

# 4. Copia los archivos construidos (debes construir localmente antes)
COPY dist/ ./dist

# 5. Variables de entorno (ajusta según tu VM)
ENV FRONTEND_URL=http://34.71.107.222
ENV DATABASE_URL=postgresql://postgres:admin123@postgres:5432/numadb?schema=public
ENV PORT=3000

EXPOSE 3000

CMD ["pnpm", "start:prod"]