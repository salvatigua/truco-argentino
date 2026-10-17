import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function rutasUsuarios(fastify: FastifyInstance) {
  // 1. Obtener todos los usuarios
  fastify.get('/api/usuarios', async () => {
    return await prisma.usuario.findMany({
      orderBy: { ultimoJuegoEn: 'desc' },
    });
  });

  // 2. Crear un nuevo usuario o traer el existente
  fastify.post<{ Body: { nombre: string; avatar?: string } }>(
    '/api/usuarios',
    async (request, reply) => {
      const { nombre, avatar = 'gaucho' } = request.body;

      if (!nombre || nombre.trim() === '') {
        return reply.status(400).send({ error: 'El nombre es obligatorio.' });
      }

      let usuario = await prisma.usuario.findUnique({
        where: { nombre: nombre.trim() },
      });

      if (!usuario) {
        usuario = await prisma.usuario.create({
          data: {
            nombre: nombre.trim(),
            avatar,
          },
        });
      }

      return usuario;
    }
  );

  // 3. Actualizar nombre y/o avatar de usuario
  fastify.patch<{
    Params: { id: string };
    Body: { nombre?: string; avatar?: string };
  }>('/api/usuarios/:id', async (request, reply) => {
    const { id } = request.params;
    const { nombre, avatar } = request.body;

    try {
      const usuarioActualizado = await prisma.usuario.update({
        where: { id },
        data: {
          ...(nombre && { nombre: nombre.trim() }),
          ...(avatar && { avatar }),
        },
      });
      return usuarioActualizado;
    } catch {
      return reply.status(404).send({ error: 'Usuario no encontrado o nombre duplicado.' });
    }
  });

  // 4. Registrar fin de partida y sumar estadísticas
  fastify.post<{
    Params: { id: string };
    Body: {
      resultado: 'VICTORIA' | 'DERROTA';
      puntosUsuario: number;
      puntosCpu: number;
      targetPuntos: number;
      conFlor: boolean;
      envidosQueridos: number;
      envidosGanados: number;
      trucosQueridos: number;
      trucosGanados: number;
    };
  }>('/api/usuarios/:id/partidas', async (request, reply) => {
    const { id } = request.params;
    const {
      resultado,
      puntosUsuario,
      puntosCpu,
      targetPuntos,
      conFlor,
      envidosQueridos,
      envidosGanados,
      trucosQueridos,
      trucosGanados,
    } = request.body;

    const esVictoria = resultado === 'VICTORIA';

    // Transacción: guarda la partida y actualiza contadores acumulados
    const [partida, usuario] = await prisma.$transaction([
      prisma.partida.create({
        data: {
          usuarioId: id,
          resultado,
          puntosUsuario,
          puntosCpu,
          targetPuntos,
          conFlor,
        },
      }),
      prisma.usuario.update({
        where: { id },
        data: {
          partidasJugadas: { increment: 1 },
          partidasGanadas: { increment: esVictoria ? 1 : 0 },
          envidosQueridos: { increment: envidosQueridos },
          envidosGanados: { increment: envidosGanados },
          trucosQueridos: { increment: trucosQueridos },
          trucosGanados: { increment: trucosGanados },
          ultimoJuegoEn: new Date(),
        },
      }),
    ]);

    return { partida, usuario };
  });
}