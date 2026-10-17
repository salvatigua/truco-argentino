import React, { useState, useEffect } from 'react';
import { Carta } from '../../../../packages/shared/src/types';
import { crearMazo, calcularEnvido } from '../../../../packages/shared/src/cards';


interface CartaJugada {
  carta: Carta;
  jugador: 'jugador' | 'cpu';
}

interface BazaEstructurada {
  jugador?: Carta;
  cpu?: Carta;
  ganador?: 'jugador' | 'cpu' | 'empate';
}

export const MesaJuego: React.FC = () => {
  // Estado de Puntos y Marcador
  const [puntosJugador, setPuntosJugador] = useState(0);
  const [puntosCpu, setPuntosCpu] = useState(0);

  // Cartas
  const [manoJugador, setManoJugador] = useState<Carta[]>([]);
  const [manoCpu, setManoCpu] = useState<Carta[]>([]);
  const [envidoCalculado, setEnvidoCalculado] = useState<number | null>(null);

  // Estructura de las 3 Bazas de la mano
  const [bazas, setBazas] = useState<BazaEstructurada[]>([]);
  const [bazaActualIdx, setBazaActualIdx] = useState<number>(0);

  // Control de Flujo y Turnos
  const [manoActual, setManoActual] = useState<'jugador' | 'cpu'>('jugador');
  const [turnoActual, setTurnoActual] = useState<'jugador' | 'cpu'>('jugador');
  const [cpuPensando, setCpuPensando] = useState(false);
  const [mensajeEstado, setMensajeEstado] = useState('¡Presiona "Repartir" para empezar!');
  const [manoTerminada, setManoTerminada] = useState(false);

  // 1. Repartir Nueva Mano
  const repartir = () => {
    const mazo = crearMazo().sort(() => Math.random() - 0.5);
    const jCartas = mazo.slice(0, 3);
    const cpuCartas = mazo.slice(3, 6);

    setManoJugador(jCartas);
    setManoCpu(cpuCartas);
    setEnvidoCalculado(calcularEnvido(jCartas));
    setBazas([{}, {}, {}]);
    setBazaActualIdx(0);
    setManoTerminada(false);

    // Alternar quién es mano
    const siguienteMano = manoActual === 'jugador' ? 'cpu' : 'jugador';
    setManoActual(siguienteMano);
    setTurnoActual(siguienteMano);

    setMensajeEstado(`Mano repartida. Es mano: ${siguienteMano === 'jugador' ? 'Tú' : 'CPU'}.`);
  };

  // Hook para activar a la CPU cuando le toca arrancar la baza/mano
  useEffect(() => {
    if (
      turnoActual === 'cpu' &&
      !cpuPensando &&
      !manoTerminada &&
      manoCpu.length > 0
    ) {
      const bazaActual = bazas[bazaActualIdx];
      // Si la baza está vacía o la CPU debe responder al tiro del jugador
      if (!bazaActual?.cpu) {
        ejecutarTurnoCpu(manoCpu, bazas, bazaActualIdx);
      }
    }
  }, [turnoActual, bazaActualIdx, manoTerminada]);



  // 2. Comparar Jerarquías de la Baza
  const evaluarBaza = (cJugador: Carta, cCpu: Carta): 'jugador' | 'cpu' | 'empate' => {
    if (cJugador.jerarquia > cCpu.jerarquia) return 'jugador';
    if (cCpu.jerarquia > cJugador.jerarquia) return 'cpu';
    return 'empate';
  };

  // 3. Evaluar si ya hay un ganador de la mano (devuelve true si la mano terminó)
  const evaluarGanadorRonda = (bazasEstado: BazaEstructurada[]): boolean => {
    const g1 = bazasEstado[0]?.ganador;
    const g2 = bazasEstado[1]?.ganador;
    const g3 = bazasEstado[2]?.ganador;

    let ganadorMano: 'jugador' | 'cpu' | null = null;

    // Caso 1: Alguien ganó 1ra y 2da baza seguidas
    if (g1 && g2 && g1 !== 'empate' && g1 === g2) {
      ganadorMano = g1;
    } 
    // Caso 2: Ganó 1ra y parda en 2da
    else if (g1 && g2 && g1 !== 'empate' && g2 === 'empate') {
      ganadorMano = g1;
    } 
    // Caso 3: Parda en 1ra y ganó 2da
    else if (g1 && g2 && g1 === 'empate' && g2 !== 'empate') {
      ganadorMano = g2;
    } 
    // Caso 4: Parda en 1ra y 2da, decide 3ra (o mano si también empata 3ra)
    else if (g1 === 'empate' && g2 === 'empate' && g3) {
      ganadorMano = g3 === 'empate' ? manoActual : g3;
    } 
    // Caso 5: 1 a 1 y decide la 3ra
    else if (g1 && g2 && g3) {
      ganadorMano = g3 === 'empate' ? g1 : g3;
    }

    if (ganadorMano) {
      setManoTerminada(true);
      if (ganadorMano === 'jugador') {
        setPuntosJugador((p) => p + 1); // +1 punto base por truco sin cantar
        setMensajeEstado('🎉 ¡Ganaste la mano! (+1 pt)');
      } else {
        setPuntosCpu((p) => p + 1);
        setMensajeEstado('🤖 La CPU ganó la mano. (+1 pt CPU)');
      }
      return true; // La mano se dio por finalizada
    }

    return false; // La mano debe continuar
  };

  // 4. Acción del Jugador
  const jugarCartaJugador = (carta: Carta) => {
    if (turnoActual !== 'jugador' || cpuPensando || manoTerminada) return;

    // Quitar carta de la mano
    const nuevaManoJ = manoJugador.filter((c) => c.id !== carta.id);
    setManoJugador(nuevaManoJ);

    const bazasCopia = [...bazas];
    const bazaActual = { ...bazasCopia[bazaActualIdx], jugador: carta };
    bazasCopia[bazaActualIdx] = bazaActual;

    setBazas(bazasCopia);

    // Si la CPU ya tiró en esta baza, cerramos la baza
    if (bazaActual.cpu) {
      cerrarBaza(bazasCopia, bazaActualIdx, nuevaManoJ, manoCpu);
    } else {
      // Si la CPU no tiró, pasa el turno a la CPU
      setTurnoActual('cpu');
      ejecutarTurnoCpu(manoCpu, bazasCopia, bazaActualIdx);
    }
  };

  // 5. Simular Turno CPU sin duplicaciones
  const ejecutarTurnoCpu = (
    cartasCpuActuales: Carta[],
    bazasEstado: BazaEstructurada[],
    bazaIdx: number
  ) => {
    if (cartasCpuActuales.length === 0 || manoTerminada) return;

    setCpuPensando(true);

    setTimeout(() => {
      // CPU selecciona la primera carta disponible
      const cartaCpu = cartasCpuActuales[0];
      const nuevaManoCpu = cartasCpuActuales.slice(1);
      setManoCpu(nuevaManoCpu);

      const bazasCopia = [...bazasEstado];
      const bazaActual = { ...bazasCopia[bazaIdx], cpu: cartaCpu };
      bazasCopia[bazaIdx] = bazaActual;

      setBazas(bazasCopia);
      setCpuPensando(false);

      // Si el jugador ya tiró en esta baza, cerramos la baza
      if (bazaActual.jugador) {
        cerrarBaza(bazasCopia, bazaIdx, manoJugador, nuevaManoCpu);
      } else {
        // Le toca al jugador
        setTurnoActual('jugador');
        setMensajeEstado(`CPU jugó ${cartaCpu.numero} de ${cartaCpu.palo}. Tu turno.`);
      }
    }, 1200);
  };

  // 6. Procesar fin de Baza
  const cerrarBaza = (
    bazasEstado: BazaEstructurada[],
    bazaIdx: number,
    jCartas: Carta[],
    cpuCartas: Carta[]
  ) => {
    const baza = bazasEstado[bazaIdx];
    if (!baza.jugador || !baza.cpu) return;

    const ganadorBaza = evaluarBaza(baza.jugador, baza.cpu);
    bazasEstado[bazaIdx].ganador = ganadorBaza;
    setBazas([...bazasEstado]);

    let msj = '';
    if (ganadorBaza === 'empate') msj = ' Baza parda (empate).';
    else msj = ` Baza para ${ganadorBaza === 'jugador' ? 'Tí' : 'la CPU'}.`;

    setMensajeEstado(`Fin de baza ${bazaIdx + 1}.${msj}`);

    // Verificar si la mano ya terminó
    const terminoMano = evaluarGanadorRonda(bazasEstado);

    // SOLO si la mano NO terminó y quedan bazas por jugar, pasamos a la siguiente
    if (!terminoMano && bazaIdx < 2) {
      const siguienteBaza = bazaIdx + 1;
      setBazaActualIdx(siguienteBaza);

      // El ganador de la baza arranca la siguiente. Si es parda, arranca quien es mano.
      const quienInicia = ganadorBaza === 'empate' ? manoActual : ganadorBaza;
      setTurnoActual(quienInicia);

      if (quienInicia === 'cpu') {
        ejecutarTurnoCpu(cpuCartas, bazasEstado, siguienteBaza);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-slate-900 min-h-screen text-slate-100 flex flex-col justify-between select-none">
      
      {/* 1. Header: Puntajes */}
      <div className="flex justify-between items-center bg-slate-800 p-3 rounded-xl border border-slate-700">
        <div className="text-center">
          <p className="text-xs text-slate-400 font-semibold">TÚ</p>
          <p className="text-2xl font-black text-emerald-400">{puntosJugador} pts</p>
        </div>
        <div className="text-center">
          <span className="text-xs bg-amber-500/20 text-amber-300 font-bold px-2 py-1 rounded">A 30 Pts</span>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-400 font-semibold">CPU</p>
          <p className="text-2xl font-black text-rose-400">{puntosCpu} pts</p>
        </div>
      </div>

      {/* 2. Zona CPU (Cartas ocultas) */}
      <div className="flex justify-center gap-2 my-1">
        {manoCpu.map((_, idx) => (
          <div key={idx} className="w-10 h-14 bg-slate-800 border border-indigo-500/50 rounded flex items-center justify-center text-xs">
            🂠
          </div>
        ))}
      </div>

      {/* 3. Tapete central ordenado por Bazas (1ra, 2da, 3ra) */}
      <div className="flex-1 bg-emerald-950/40 border-2 border-dashed border-emerald-800/60 rounded-2xl p-3 flex flex-col justify-between my-2 relative">
        <p className="text-xs text-emerald-300 font-semibold text-center mb-2">{mensajeEstado}</p>

        {cpuPensando && (
          <div className="absolute top-2 right-2 bg-amber-500 text-slate-950 font-bold text-xs px-2 py-0.5 rounded-full animate-pulse">
            🤖 CPU pensando...
          </div>
        )}

        {/* Muestra las 3 Bazas de arriba a abajo */}
        <div className="flex flex-col gap-2">
          {bazas.map((baza, idx) => (
            <div key={idx} className="bg-slate-900/60 p-2 rounded-lg border border-slate-700/50 flex justify-between items-center text-xs">
              <span className="font-bold text-slate-400">Baza {idx + 1}</span>
              
              {/* Carta Tuya */}
              <div className="font-semibold text-emerald-300">
                {baza.jugador ? `${baza.jugador.numero} de ${baza.jugador.palo}` : '-'}
              </div>

              {/* Carta CPU */}
              <div className="font-semibold text-rose-300">
                {baza.cpu ? `${baza.cpu.numero} de ${baza.cpu.palo}` : '-'}
              </div>

              {/* Resultado Baza */}
              <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded bg-slate-800 text-amber-400">
                {baza.ganador || 'En juego'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Tus Cartas en Mano */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-slate-400 font-semibold">Tus Cartas</span>
          {envidoCalculado !== null && (
            <span className="text-xs bg-emerald-950 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-800">
              Envido: {envidoCalculado}
            </span>
          )}
        </div>

        <div className="flex justify-center gap-2 mb-3">
          {manoJugador.map((carta) => (
            <button
              key={carta.id}
              onClick={() => jugarCartaJugador(carta)}
              disabled={turnoActual !== 'jugador' || cpuPensando || manoTerminada}
              className="flex-1 bg-slate-800 hover:bg-slate-700 active:scale-95 disabled:opacity-40 p-2.5 rounded-xl border-2 border-slate-600 flex flex-col items-center shadow transition-all"
            >
              <span className="text-lg font-bold text-amber-400">{carta.numero}</span>
              <span className="text-xs text-slate-300 capitalize">{carta.palo}</span>
            </button>
          ))}
        </div>

        {/* 5. Botonera */}
        <div className="grid grid-cols-3 gap-2">
          <button
            disabled={true}
            className="bg-indigo-600/40 opacity-50 font-bold py-2 rounded-lg text-xs"
          >
            Envido
          </button>
          <button
            disabled={true}
            className="bg-amber-600/40 opacity-50 font-bold py-2 rounded-lg text-xs"
          >
            Truco
          </button>
          <button
            onClick={repartir}
            disabled={cpuPensando}
            className="bg-emerald-600 hover:bg-emerald-500 font-bold py-2 rounded-lg text-xs active:scale-95 transition-all"
          >
            🔄 Repartir
          </button>
        </div>
      </div>

    </div>
  );
};