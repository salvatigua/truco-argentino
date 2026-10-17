FROM node:20-alpine

# Instalar OpenSSL necesario para Prisma en Alpine Linux
RUN apk add --no-cache openssl

WORKDIR /app

# Copiar el paquete compartido
COPY packages/shared ./packages/shared

# Copiar la app del backend
COPY apps/backend ./apps/backend

WORKDIR /app/apps/backend

# Instalar dependencias
RUN npm install

# Generar el cliente de Prisma
RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "dev"]