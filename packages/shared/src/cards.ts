import { Carta, Numero, Palo } from './types.js';

// Genera la jerarquía de Truco para cada carta
function obtenerJerarquia(numero: Numero, palo: Palo): number {
  if (numero === 1 && palo === 'espada') return 14;
  if (numero === 1 && palo === 'basto') return 13;
  if (numero === 7 && palo === 'espada') return 12;
  if (numero === 7 && palo === 'oro') return 11;
  if (numero === 3) return 10;
  if (numero === 2) return 9;
  if (numero === 1) return 8; // Oro y Copa
  if (numero === 12) return 7;
  if (numero === 11) return 6;
  if (numero === 10) return 5;
  if (numero === 7) return 4; // Basto y Copa
  if (numero === 6) return 3;
  if (numero === 5) return 2;
  if (numero === 4) return 1;
  return 0;
}

// Valor individual para Envido/Flor
function obtenerValorEnvido(numero: Numero): number {
  return numero >= 10 ? 0 : numero;
}

// Crear Mazo Completo de 40 Cartas
export function crearMazo(): Carta[] {
  const palos: Palo[] = ['espada', 'basto', 'oro', 'copa'];
  const numeros: Numero[] = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12];
  const mazo: Carta[] = [];

  for (const palo of palos) {
    for (const numero of numeros) {
      mazo.push({
        id: `${numero}-${palo}`,
        numero,
        palo,
        jerarquia: obtenerJerarquia(numero, palo),
        valorEnvido: obtenerValorEnvido(numero),
      });
    }
  }

  return mazo;
}

// Función para calcular los puntos de Envido de una mano de 3 cartas
export function calcularEnvido(mano: Carta[]): number {
  if (mano.length !== 3) return 0;

  // Agrupar por palo
  const porPalo: Record<Palo, Carta[]> = {
    espada: [],
    basto: [],
    oro: [],
    copa: [],
  };

  mano.forEach((carta) => porPalo[carta.palo].push(carta));

  let maxEnvido = 0;

  for (const palo in porPalo) {
    const cartasDelPalo = porPalo[palo as Palo];
    
    if (cartasDelPalo.length >= 2) {
      // Ordenar de mayor a menor según su valorEnvido
      cartasDelPalo.sort((a, b) => b.valorEnvido - a.valorEnvido);
      const puntos = 20 + cartasDelPalo[0].valorEnvido + cartasDelPalo[1].valorEnvido;
      if (puntos > maxEnvido) maxEnvido = puntos;
    }
  }

  // Si no hay 2 del mismo palo, el envido es el valor nominal de la carta más alta
  if (maxEnvido === 0) {
    maxEnvido = Math.max(...mano.map((c) => c.valorEnvido));
  }

  return maxEnvido;
}

export interface ResultadoFlor {
  tieneFlor: boolean;
  puntos: number;
}

export function calcularFlor(mano: Carta[]): ResultadoFlor {
  if (mano.length !== 3) return { tieneFlor: false, puntos: 0 };

  const primerPalo = mano[0].palo;
  const esMismoPalo = mano.every((carta) => carta.palo === primerPalo);

  if (!esMismoPalo) return { tieneFlor: false, puntos: 0 };

  const sumaValores = mano.reduce((acc, carta) => acc + carta.valorEnvido, 0);
  return {
    tieneFlor: true,
    puntos: 20 + sumaValores,
  };
}