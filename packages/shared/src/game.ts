import { Carta, PuntosTotales } from './types.js';

export type EstadoCantoEnvido = 
  | 'NADIE' 
  | 'ENVIDO' 
  | 'ENVIDO_ENVIDO' 
  | 'REAL_ENVIDO' 
  | 'FALTA_ENVIDO' 
  | 'RESUELTO';

export type EstadoCantoTruco = 
  | 'NADIE' 
  | 'TRUCO' 
  | 'RETRUCO' 
  | 'VALE_CUATRO';

export type JugadorId = 'jugador' | 'cpu';

export type TipoCanto = 
  | 'ENVIDO' 
  | 'ENVIDO_ENVIDO' 
  | 'REAL_ENVIDO' 
  | 'FALTA_ENVIDO' 
  | 'TRUCO' 
  | 'RETRUCO' 
  | 'VALE_CUATRO' 
  | 'FLOR' 
  | 'CONTRAFLOR' 
  | 'CONTRAFLOR_AL_RESTO'
  | 'QUIERO' 
  | 'NO_QUIERO' 
  | 'MAZO';

export interface Baza {
  cartaJugador?: Carta;
  cartaCpu?: Carta;
  ganador?: JugadorId | 'empate';
}

export function evaluarGanadorRonda(bazas: Baza[], mano: JugadorId): JugadorId | null {
  const g1 = bazas[0]?.ganador;
  const g2 = bazas[1]?.ganador;
  const g3 = bazas[2]?.ganador;

  if (!g1) return null;

  if (g1 !== 'empate' && g1 === g2) return g1;

  if (g1 !== 'empate' && (g2 === 'empate' || g3 === 'empate')) {
    if (g2 === 'empate' && !g3) return g1;
    if (g3 === 'empate') return g1;
  }

  if (g1 === 'empate' && g2 && g2 !== 'empate') return g2;
  if (g1 === 'empate' && g2 === 'empate' && g3 && g3 !== 'empate') return g3;
  if (g1 === 'empate' && g2 === 'empate' && g3 === 'empate') return mano;
  if (g3 && g3 !== 'empate') return g3;

  return null;
}

export function calcularPuntosFaltaEnvido(
  puntosJugador: number,
  puntosCpu: number,
  target: PuntosTotales
): number {
  const limiteMalas = target / 2;
  const enBuenas = puntosJugador >= limiteMalas || puntosCpu >= limiteMalas;

  if (!enBuenas) {
    return target;
  } else {
    const maxPuntos = Math.max(puntosJugador, puntosCpu);
    return target - maxPuntos;
  }
}

export function procesarCantoEnvido(
  cantoActual: EstadoCantoEnvido,
  nuevoCanto: 'ENVIDO' | 'ENVIDO_ENVIDO' | 'REAL_ENVIDO' | 'FALTA_ENVIDO',
  puntosJugador: number,
  puntosCpu: number,
  target: PuntosTotales
): { enJuego: number; rechazo: number; nuevoEstado: EstadoCantoEnvido } {
  let enJuego = 2;
  let rechazo = 1;
  let nuevoEstado: EstadoCantoEnvido = 'ENVIDO';

  if (cantoActual === 'NADIE') {
    if (nuevoCanto === 'ENVIDO') {
      enJuego = 2;
      rechazo = 1;
      nuevoEstado = 'ENVIDO';
    } else if (nuevoCanto === 'REAL_ENVIDO') {
      enJuego = 3;
      rechazo = 1;
      nuevoEstado = 'REAL_ENVIDO';
    } else if (nuevoCanto === 'FALTA_ENVIDO') {
      enJuego = calcularPuntosFaltaEnvido(puntosJugador, puntosCpu, target);
      rechazo = 1;
      nuevoEstado = 'FALTA_ENVIDO';
    }
  } else if (cantoActual === 'ENVIDO') {
    if (nuevoCanto === 'ENVIDO' || nuevoCanto === 'ENVIDO_ENVIDO') {
      enJuego = 4;
      rechazo = 2;
      nuevoEstado = 'ENVIDO_ENVIDO';
    } else if (nuevoCanto === 'REAL_ENVIDO') {
      enJuego = 5;
      rechazo = 2;
      nuevoEstado = 'REAL_ENVIDO';
    } else if (nuevoCanto === 'FALTA_ENVIDO') {
      enJuego = calcularPuntosFaltaEnvido(puntosJugador, puntosCpu, target);
      rechazo = 2;
      nuevoEstado = 'FALTA_ENVIDO';
    }
  } else if (cantoActual === 'ENVIDO_ENVIDO') {
    if (nuevoCanto === 'REAL_ENVIDO') {
      enJuego = 7;
      rechazo = 4;
      nuevoEstado = 'REAL_ENVIDO';
    } else if (nuevoCanto === 'FALTA_ENVIDO') {
      enJuego = calcularPuntosFaltaEnvido(puntosJugador, puntosCpu, target);
      rechazo = 4;
      nuevoEstado = 'FALTA_ENVIDO';
    }
  } else if (cantoActual === 'REAL_ENVIDO') {
    if (nuevoCanto === 'FALTA_ENVIDO') {
      enJuego = calcularPuntosFaltaEnvido(puntosJugador, puntosCpu, target);
      rechazo = 5;
      nuevoEstado = 'FALTA_ENVIDO';
    }
  }

  return { enJuego, rechazo, nuevoEstado };
}