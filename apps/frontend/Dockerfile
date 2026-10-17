FROM node:20-alpine

WORKDIR /app

# Copiar el paquete compartido e instalar sus archivos
COPY packages/shared ./packages/shared

# Copiar la app del frontend
COPY apps/frontend ./apps/frontend

WORKDIR /app/apps/frontend

# Instalar dependencias dentro de la carpeta del frontend
RUN npm install

EXPOSE 5173

CMD ["npm", "run", "dev"]