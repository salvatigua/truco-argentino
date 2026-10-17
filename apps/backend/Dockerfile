FROM node:20-alpine

WORKDIR /app

# Copiar el paquete compartido
COPY packages/shared ./packages/shared

# Copiar la app del backend
COPY apps/backend ./apps/backend

WORKDIR /app/apps/backend

# Instalar dependencias dentro de la carpeta del backend
RUN npm install

EXPOSE 3000

CMD ["npm", "run", "dev"]