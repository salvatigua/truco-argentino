import Fastify from 'fastify';
import cors from '@fastify/cors';
import { crearMazo, calcularEnvido } from '../../../packages/shared/src/cards.js';

const fastify = Fastify({ logger: true });

fastify.register(cors, { origin: '*' });

fastify.get('/api/health', async () => {
  return { status: 'ok', message: 'Servidor del Truco Argentino activo 🃏🔥' };
});

// Endpoint para probar repartir mano y calcular envido
fastify.get('/api/test-envido', async () => {
  const mazo = crearMazo();
  // Mezclar
  const mazoMezclado = [...mazo].sort(() => Math.random() - 0.5);
  const manoJugador = mazoMezclado.slice(0, 3);
  const envido = calcularEnvido(manoJugador);

  return {
    mano: manoJugador,
    envidoCalculado: envido,
  };
});

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3000;
    const host = process.env.HOST || '0.0.0.0';
    await fastify.listen({ port, host });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();