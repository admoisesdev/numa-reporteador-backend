FROM node:18-alpine

WORKDIR /app

# Instalar dependencias globales
RUN npm install -g netlify-cli

# Copiar archivos de configuración
COPY netlify.toml package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto de los archivos
COPY . .

# Variables de entorno
ENV DATABASE_URL=${DATABASE_URL}
ENV FRONTEND_URL=${FRONTEND_URL}
ENV NETLIFY_DEV_PORT=8888
ENV NODE_ENV=production

# Configuración CORS para desarrollo
ENV NETLIFY_DEV_CORS_ALLOWED_ORIGINS=${FRONTEND_URL}
ENV NETLIFY_DEV_CORS_ALLOWED_METHODS=GET,POST,PUT,DELETE,OPTIONS
ENV NETLIFY_DEV_CORS_ALLOWED_HEADERS=Content-Type,Authorization

EXPOSE 8888

# Comando optimizado para producción
CMD ["sh", "-c", "netlify dev --port $NETLIFY_DEV_PORT --host 0.0.0.0 --live"]