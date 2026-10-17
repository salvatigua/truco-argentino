import { PuntosTotales } from './types.js';

export interface EstadoAnotador {
  nosotros: number;
  ellos: number;
  target: PuntosTotales;
  limiteMalas: number; // Ej: 15 si se juega a 30, o 12 si se juega a 24
  esBuenasYMalas: boolean;
}

export function crearAnotador(target: PuntosTotales): EstadoAnotador {
  const esBuenasYMalas = target === 24 || target === 30;
  return {
    nosotros: 0,
    ellos: 0,
    target,
    limiteMalas: esBuenasYMalas ? target / 2 : target,
    esBuenasYMalas,
  };
}

export function modificarPuntos(
  estado: EstadoAnotador,
  equipo: 'nosotros' | 'ellos',
  delta: number // +1 o -1
): EstadoAnotador {
  const nuevoPuntaje = Math.min(
    Math.max(0, estado[equipo] + delta),
    estado.target
  );

  return {
    ...estado,
    [equipo]: nuevoPuntaje,
  };
}