import Fastify from 'fastify';
import cors from '@fastify/cors';
import { rutasUsuarios } from './routes/usuarios.js';

const fastify = Fastify({ logger: true });

// Health check
fastify.get('/api/health', async () => {
  return { status: 'ok', message: 'Servidor del Truco Argentino activo 🃏🔥' };
});

const start = async () => {
  try {
    // Registrar plugins dentro de la función async
    await fastify.register(cors, {
      origin: true,
      methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    });

    await fastify.register(rutasUsuarios);

    const port = Number(process.env.PORT) || 3000;
    const host = process.env.HOST || '0.0.0.0';

    await fastify.listen({ port, host });
    console.log(`🚀 Servidor backend corriendo en http://${host}:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();