export type Palo = 'espada' | 'basto' | 'oro' | 'copa';
export type Numero = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 10 | 11 | 12;

export interface Carta {
  id: string; // ej: "1-espada"
  numero: Numero;
  palo: Palo;
  jerarquia: number; // 1 (4) a 14 (1 de espada)
  valorEnvido: number; // 0 para 10,11,12; valor nominal para 1..7
}

export type PuntosTotales = 12 | 15 | 24 | 30;

export interface ConfigPartida {
  puntosTarget: PuntosTotales;
  conFlor: boolean;
}