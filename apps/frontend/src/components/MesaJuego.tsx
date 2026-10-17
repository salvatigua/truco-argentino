import React, { useState, useEffect } from 'react';
import {
  Carta,
  crearMazo,
  calcularEnvido,
  procesarCantoEnvido,
  TipoCanto,
  EstadoCantoEnvido,
  EstadoCantoTruco,
  PuntosTotales,
} from '@truco/shared';
import { Usuario } from './Perfil';

interface BazaEstructurada {
  jugador?: Carta;
  cpu?: Carta;
  ganador?: 'jugador' | 'cpu' | 'empate';
}

interface Props {
  usuarioActivo: Usuario | null;
}

export const MesaJuego: React.FC<Props> = ({ usuarioActivo }) => {
  const [targetPuntos] = useState<PuntosTotales>(30);
  const [puntosJugador, setPuntosJugador] = useState(0);
  const [puntosCpu, setPuntosCpu] = useState(0);

  // Cartas
  const [manoJugador, setManoJugador] = useState<Carta[]>([]);
  const [manoCpu, setManoCpu] = useState<Carta[]>([]);
  const [envidoJugador, setEnvidoJugador] = useState<number>(0);
  const [envidoCpu, setEnvidoCpu] = useState<number>(0);

  // Bazas
  const [bazas, setBazas] = useState<BazaEstructurada[]>([{}, {}, {}]);
  const [bazaActualIdx, setBazaActualIdx] = useState<number>(0);

  // Estados de Apuestas
  const [estadoEnvido, setEstadoEnvido] = useState<EstadoCantoEnvido>('NADIE');
  const [ptsEnvidoEnJuego, setPtsEnvidoEnJuego] = useState(0);
  const [ptsEnvidoRechazo, setPtsEnvidoRechazo] = useState(1);
  const [envidoResuelto, setEnvidoResuelto] = useState(false);

  const [estadoTruco, setEstadoTruco] = useState<EstadoCantoTruco>('NADIE');
  const [ptsTrucoEnJuego, setPtsTrucoEnJuego] = useState(1);
  const [cantanteTruco, setCantanteTruco] = useState<'jugador' | 'cpu' | null>(null);

  const [apuestaPendiente, setApuestaPendiente] = useState<TipoCanto | null>(null);
  const [quienDebeResponder, setQuienDebeResponder] = useState<'jugador' | 'cpu' | null>(null);

  // Turnos y Mensajes
  const [manoActual, setManoActual] = useState<'jugador' | 'cpu'>('jugador');
  const [turnoActual, setTurnoActual] = useState<'jugador' | 'cpu'>('jugador');
  const [cpuPensando, setCpuPensando] = useState(false);
  const [mensajeEstado, setMensajeEstado] = useState('¡Presiona "Repartir" para empezar!');
  const [manoTerminada, setManoTerminada] = useState(true); // Inicia true para obligar a repartir la 1a mano
  const [partidaFinalizada, setPartidaFinalizada] = useState(false);

  // Métricas acumuladas para la partida
  const [envidosQueridos, setEnvidosQueridos] = useState(0);
  const [envidosGanados, setEnvidosGanados] = useState(0);
  const [trucosQueridos, setTrucosQueridos] = useState(0);
  const [trucosGanados, setTrucosGanados] = useState(0);

  // Registrar partida en la API al llegar al target
  const guardarPartidaEnApi = async (ptsJ: number, ptsC: number) => {
    if (!usuarioActivo || partidaFinalizada) return;

    const esVictoria = ptsJ >= targetPuntos;
    setPartidaFinalizada(true);

    try {
      await fetch(`http://localhost:3000/api/usuarios/${usuarioActivo.id}/partidas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resultado: esVictoria ? 'VICTORIA' : 'DERROTA',
          puntosUsuario: ptsJ,
          puntosCpu: ptsC,
          targetPuntos,
          conFlor: false,
          envidosQueridos,
          envidosGanados,
          trucosQueridos,
          trucosGanados,
        }),
      });
    } catch (e) {
      console.error('Error al guardar la partida:', e);
    }
  };

  // Sumar puntos e invocar verificación de fin de partida
  const sumarPuntos = (jugador: 'jugador' | 'cpu', cantidad: number) => {
    if (jugador === 'jugador') {
      const nuevoPuntaje = puntosJugador + cantidad;
      setPuntosJugador(nuevoPuntaje);
      if (nuevoPuntaje >= targetPuntos) {
        setMensajeEstado(`🏆 ¡GANASTE LA PARTIDA! (${nuevoPuntaje} pts)`);
        setManoTerminada(true);
        guardarPartidaEnApi(nuevoPuntaje, puntosCpu);
      }
    } else {
      const nuevoPuntaje = puntosCpu + cantidad;
      setPuntosCpu(nuevoPuntaje);
      if (nuevoPuntaje >= targetPuntos) {
        setMensajeEstado(`💀 La CPU ganó la partida (${nuevoPuntaje} pts).`);
        setManoTerminada(true);
        guardarPartidaEnApi(puntosJugador, nuevoPuntaje);
      }
    }
  };

  // 1. Repartir Nueva Mano
  const repartir = () => {
    if (partidaFinalizada) {
      // Reiniciar marcador completo para una nueva partida
      setPuntosJugador(0);
      setPuntosCpu(0);
      setPartidaFinalizada(false);
      setEnvidosQueridos(0);
      setEnvidosGanados(0);
      setTrucosQueridos(0);
      setTrucosGanados(0);
    }

    const mazo = crearMazo().sort(() => Math.random() - 0.5);
    const jCartas = mazo.slice(0, 3);
    const cpuCartas = mazo.slice(3, 6);

    setManoJugador(jCartas);
    setManoCpu(cpuCartas);
    setEnvidoJugador(calcularEnvido(jCartas));
    setEnvidoCpu(calcularEnvido(cpuCartas));

    setBazas([{}, {}, {}]);
    setBazaActualIdx(0);
    setManoTerminada(false);

    // Resetear apuestas de la mano
    setEstadoEnvido('NADIE');
    setPtsEnvidoEnJuego(0);
    setPtsEnvidoRechazo(1);
    setEnvidoResuelto(false);
    setEstadoTruco('NADIE');
    setPtsTrucoEnJuego(1);
    setCantanteTruco(null);
    setApuestaPendiente(null);
    setQuienDebeResponder(null);

    const siguienteMano = manoActual === 'jugador' ? 'cpu' : 'jugador';
    setManoActual(siguienteMano);
    setTurnoActual(siguienteMano);

    setMensajeEstado(`Mano repartida. Es mano: ${siguienteMano === 'jugador' ? 'Tú' : 'CPU'}.`);
  };

  // 2. Activar la CPU cuando le toca jugar o responder
  useEffect(() => {
    if (cpuPensando || manoTerminada || partidaFinalizada) return;

    if (quienDebeResponder === 'cpu' && apuestaPendiente) {
      responderCpuApuesta();
    } else if (turnoActual === 'cpu' && !quienDebeResponder && manoCpu.length > 0) {
      const bazaActual = bazas[bazaActualIdx];
      if (!bazaActual?.cpu) {
        ejecutarTurnoCpu(manoCpu, bazas, bazaActualIdx);
      }
    }
  }, [turnoActual, quienDebeResponder, apuestaPendiente, bazaActualIdx, manoTerminada, partidaFinalizada]);

  // 3. Respuesta simulada de la CPU a los cantos
  const responderCpuApuesta = () => {
    setCpuPensando(true);
    setTimeout(() => {
      setCpuPensando(false);

      const acepta = Math.random() > 0.25;

      if (
        apuestaPendiente === 'ENVIDO' ||
        apuestaPendiente === 'REAL_ENVIDO' ||
        apuestaPendiente === 'FALTA_ENVIDO'
      ) {
        setEnvidosQueridos((v) => v + 1);

        if (acepta) {
          setEnvidoResuelto(true);
          setApuestaPendiente(null);
          setQuienDebeResponder(null);

          if (
            envidoJugador > envidoCpu ||
            (envidoJugador === envidoCpu && manoActual === 'jugador')
          ) {
            setEnvidosGanados((v) => v + 1);
            setMensajeEstado(
              `🎉 Ganaste el Envido (+${ptsEnvidoEnJuego} pts). Tu ${envidoJugador} le gana a ${envidoCpu}.`
            );
            sumarPuntos('jugador', ptsEnvidoEnJuego);
          } else {
            setMensajeEstado(
              `🤖 CPU gana el Envido (+${ptsEnvidoEnJuego} pts). Su ${envidoCpu} le gana a tu ${envidoJugador}.`
            );
            sumarPuntos('cpu', ptsEnvidoEnJuego);
          }
        } else {
          setMensajeEstado(`🤖 CPU dice: "No Quiero". (+${ptsEnvidoRechazo} pt para ti).`);
          setEnvidosGanados((v) => v + 1);
          sumarPuntos('jugador', ptsEnvidoRechazo);
          setEnvidoResuelto(true);
          setApuestaPendiente(null);
          setQuienDebeResponder(null);
        }
      } else if (
        apuestaPendiente === 'TRUCO' ||
        apuestaPendiente === 'RETRUCO' ||
        apuestaPendiente === 'VALE_CUATRO'
      ) {
        setTrucosQueridos((v) => v + 1);

        if (acepta) {
          setMensajeEstado(`🤖 CPU dice: "¡Quiero!" al ${apuestaPendiente}.`);
          setPtsTrucoEnJuego(
            apuestaPendiente === 'TRUCO' ? 2 : apuestaPendiente === 'RETRUCO' ? 3 : 4
          );
          setApuestaPendiente(null);
          setQuienDebeResponder(null);
        } else {
          setTrucosGanados((v) => v + 1);
          setMensajeEstado(
            `🤖 CPU dice: "No Quiero". Ganaste la mano (+${ptsTrucoEnJuego} pt).`
          );
          sumarPuntos('jugador', ptsTrucoEnJuego);
          setManoTerminada(true);
          setApuestaPendiente(null);
          setQuienDebeResponder(null);
        }
      }
    }, 1300);
  };

  // 4. Cantar por parte del Jugador
  const cantarJugador = (canto: TipoCanto) => {
    if (cpuPensando || manoTerminada || partidaFinalizada) return;

    if (canto === 'ENVIDO' || canto === 'REAL_ENVIDO' || canto === 'FALTA_ENVIDO') {
      const res = procesarCantoEnvido(
        estadoEnvido,
        canto,
        puntosJugador,
        puntosCpu,
        targetPuntos
      );
      setEstadoEnvido(res.nuevoEstado);
      setPtsEnvidoEnJuego(res.enJuego);
      setPtsEnvidoRechazo(res.rechazo);
      setApuestaPendiente(canto);
      setQuienDebeResponder('cpu');
      setMensajeEstado(`Cantaste ${canto}. Esperando respuesta de la CPU...`);
    } else if (canto === 'TRUCO') {
      setEstadoTruco('TRUCO');
      setCantanteTruco('jugador');
      setApuestaPendiente('TRUCO');
      setQuienDebeResponder('cpu');
      setMensajeEstado('Cantaste TRUCO! Esperando respuesta de la CPU...');
    } else if (canto === 'RETRUCO') {
      setEstadoTruco('RETRUCO');
      setCantanteTruco('jugador');
      setApuestaPendiente('RETRUCO');
      setQuienDebeResponder('cpu');
      setMensajeEstado('Cantaste RETRUCO! Esperando respuesta...');
    } else if (canto === 'VALE_CUATRO') {
      setEstadoTruco('VALE_CUATRO');
      setCantanteTruco('jugador');
      setApuestaPendiente('VALE_CUATRO');
      setQuienDebeResponder('cpu');
      setMensajeEstado('Cantaste VALE CUATRO! Esperando respuesta...');
    } else if (canto === 'MAZO') {
      setMensajeEstado(`Te fuiste al mazo. CPU suma +${ptsTrucoEnJuego} pt.`);
      sumarPuntos('cpu', ptsTrucoEnJuego);
      setManoTerminada(true);
    }
  };

  // 5. Comparación y ejecución de Bazas
  const evaluarBaza = (cJugador: Carta, cCpu: Carta): 'jugador' | 'cpu' | 'empate' => {
    if (cJugador.jerarquia > cCpu.jerarquia) return 'jugador';
    if (cCpu.jerarquia > cJugador.jerarquia) return 'cpu';
    return 'empate';
  };

  const evaluarGanadorRonda = (bazasEstado: BazaEstructurada[]): boolean => {
    const g1 = bazasEstado[0]?.ganador;
    const g2 = bazasEstado[1]?.ganador;
    const g3 = bazasEstado[2]?.ganador;

    let ganadorMano: 'jugador' | 'cpu' | null = null;

    if (g1 && g2 && g1 !== 'empate' && g1 === g2) ganadorMano = g1;
    else if (g1 && g2 && g1 !== 'empate' && g2 === 'empate') ganadorMano = g1;
    else if (g1 && g2 && g1 === 'empate' && g2 !== 'empate') ganadorMano = g2;
    else if (g1 === 'empate' && g2 === 'empate' && g3) {
      ganadorMano = g3 === 'empate' ? manoActual : g3;
    } else if (g1 && g2 && g3) {
      ganadorMano = g3 === 'empate' ? g1 : g3;
    }

    if (ganadorMano) {
      setManoTerminada(true);
      if (ganadorMano === 'jugador') {
        if (estadoTruco !== 'NADIE') setTrucosGanados((v) => v + 1);
        setMensajeEstado(`🎉 ¡Ganaste la mano! (+${ptsTrucoEnJuego} pts)`);
        sumarPuntos('jugador', ptsTrucoEnJuego);
      } else {
        setMensajeEstado(`🤖 CPU ganó la mano. (+${ptsTrucoEnJuego} pts CPU)`);
        sumarPuntos('cpu', ptsTrucoEnJuego);
      }
      return true;
    }
    return false;
  };

  const jugarCartaJugador = (carta: Carta) => {
    if (
      turnoActual !== 'jugador' ||
      cpuPensando ||
      manoTerminada ||
      quienDebeResponder !== null ||
      partidaFinalizada
    )
      return;

    const nuevaManoJ = manoJugador.filter((c) => c.id !== carta.id);
    setManoJugador(nuevaManoJ);

    const bazasCopia = [...bazas];
    const bazaActual = { ...bazasCopia[bazaActualIdx], jugador: carta };
    bazasCopia[bazaActualIdx] = bazaActual;
    setBazas(bazasCopia);

    if (bazaActual.cpu) {
      cerrarBaza(bazasCopia, bazaActualIdx, nuevaManoJ, manoCpu);
    } else {
      setTurnoActual('cpu');
    }
  };

  const ejecutarTurnoCpu = (
    cartasCpuActuales: Carta[],
    bazasEstado: BazaEstructurada[],
    bazaIdx: number
  ) => {
    if (cartasCpuActuales.length === 0 || manoTerminada || partidaFinalizada) return;

    setCpuPensando(true);
    setTimeout(() => {
      const cartaCpu = cartasCpuActuales[0];
      const nuevaManoCpu = cartasCpuActuales.slice(1);
      setManoCpu(nuevaManoCpu);

      const bazasCopia = [...bazasEstado];
      const bazaActual = { ...bazasCopia[bazaIdx], cpu: cartaCpu };
      bazasCopia[bazaIdx] = bazaActual;

      setBazas(bazasCopia);
      setCpuPensando(false);

      if (bazaActual.jugador) {
        cerrarBaza(bazasCopia, bazaIdx, manoJugador, nuevaManoCpu);
      } else {
        setTurnoActual('jugador');
        setMensajeEstado(`CPU jugó ${cartaCpu.numero} de ${cartaCpu.palo}. Tu turno.`);
      }
    }, 1200);
  };

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

    let msj =
      ganadorBaza === 'empate'
        ? ' Baza parda.'
        : ` Baza para ${ganadorBaza === 'jugador' ? 'Tí' : 'CPU'}.`;
    setMensajeEstado(`Fin de baza ${bazaIdx + 1}.${msj}`);

    const terminoMano = evaluarGanadorRonda(bazasEstado);

    if (!terminoMano && bazaIdx < 2) {
      const siguienteBaza = bazaIdx + 1;
      setBazaActualIdx(siguienteBaza);
      const quienInicia = ganadorBaza === 'empate' ? manoActual : ganadorBaza;
      setTurnoActual(quienInicia);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-slate-900 min-h-screen text-slate-100 flex flex-col justify-between select-none">
      {/* Marcador */}
      <div className="flex justify-between items-center bg-slate-800 p-3 rounded-xl border border-slate-700 shadow">
        <div className="text-center">
          <p className="text-xs text-slate-400 font-semibold truncate max-w-[80px]">
            {usuarioActivo ? usuarioActivo.nombre : 'TÚ'}
          </p>
          <p className="text-2xl font-black text-emerald-400">{puntosJugador} pts</p>
        </div>
        <div className="text-center">
          <span className="text-xs bg-amber-500/20 text-amber-300 font-bold px-2 py-1 rounded">
            A {targetPuntos} Pts
          </span>
        </div>
        <div className="text-center">
          <p className="text-xs text-slate-400 font-semibold">CPU</p>
          <p className="text-2xl font-black text-rose-400">{puntosCpu} pts</p>
        </div>
      </div>

      {/* Cartas CPU */}
      <div className="flex justify-center gap-2 my-1">
        {manoCpu.map((_, idx) => (
          <div
            key={idx}
            className="w-10 h-14 bg-slate-800 border border-indigo-500/50 rounded flex items-center justify-center text-xs shadow"
          >
            🂠
          </div>
        ))}
      </div>

      {/* Mesa Central */}
      <div className="flex-1 bg-emerald-950/40 border-2 border-dashed border-emerald-800/60 rounded-2xl p-3 flex flex-col justify-between my-2 relative">
        <p className="text-xs text-emerald-300 font-semibold text-center mb-2">
          {mensajeEstado}
        </p>

        {cpuPensando && (
          <div className="absolute top-2 right-2 bg-amber-500 text-slate-950 font-bold text-xs px-2 py-0.5 rounded-full animate-pulse">
            🤖 CPU pensando...
          </div>
        )}

        <div className="flex flex-col gap-2">
          {bazas.map((baza, idx) => (
            <div
              key={idx}
              className="bg-slate-900/60 p-2 rounded-lg border border-slate-700/50 flex justify-between items-center text-xs"
            >
              <span className="font-bold text-slate-400">Baza {idx + 1}</span>
              <div className="font-semibold text-emerald-300">
                {baza.jugador ? `${baza.jugador.numero} de ${baza.jugador.palo}` : '-'}
              </div>
              <div className="font-semibold text-rose-300">
                {baza.cpu ? `${baza.cpu.numero} de ${baza.cpu.palo}` : '-'}
              </div>
              <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded bg-slate-800 text-amber-400">
                {baza.ganador || 'En juego'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tus Cartas */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-slate-400 font-semibold">Tus Cartas</span>
          <span className="text-xs bg-emerald-950 text-emerald-300 font-bold px-2 py-0.5 rounded border border-emerald-800">
            Envido: {envidoJugador}
          </span>
        </div>

        <div className="flex justify-center gap-2 mb-3">
          {manoJugador.map((carta) => (
            <button
              key={carta.id}
              onClick={() => jugarCartaJugador(carta)}
              disabled={
                turnoActual !== 'jugador' ||
                cpuPensando ||
                manoTerminada ||
                quienDebeResponder !== null ||
                partidaFinalizada
              }
              className="flex-1 bg-slate-800 hover:bg-slate-700 active:scale-95 disabled:opacity-40 p-2.5 rounded-xl border-2 border-slate-600 flex flex-col items-center shadow transition-all"
            >
              <span className="text-lg font-bold text-amber-400">{carta.numero}</span>
              <span className="text-xs text-slate-300 capitalize">{carta.palo}</span>
            </button>
          ))}
        </div>

        {/* Botonera Dinámica de Cantos */}
        <div className="grid grid-cols-3 gap-2">
          {/* Botón Envido */}
          <button
            onClick={() => cantarJugador('ENVIDO')}
            disabled={
              bazaActualIdx > 0 ||
              envidoResuelto ||
              cpuPensando ||
              manoTerminada ||
              quienDebeResponder !== null ||
              partidaFinalizada
            }
            className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 font-bold py-2 rounded-lg text-xs transition-all active:scale-95"
          >
            Envido
          </button>

          {/* Botón Truco */}
          <button
            onClick={() =>
              cantarJugador(
                estadoTruco === 'NADIE'
                  ? 'TRUCO'
                  : estadoTruco === 'TRUCO'
                  ? 'RETRUCO'
                  : 'VALE_CUATRO'
              )
            }
            disabled={
              cpuPensando ||
              manoTerminada ||
              cantanteTruco === 'jugador' ||
              quienDebeResponder !== null ||
              partidaFinalizada
            }
            className="bg-amber-600 hover:bg-amber-500 disabled:opacity-30 font-bold py-2 rounded-lg text-xs transition-all active:scale-95"
          >
            {estadoTruco === 'NADIE'
              ? 'Truco'
              : estadoTruco === 'TRUCO'
              ? 'Retruco'
              : 'Vale Cuatro'}
          </button>

          {/* Botón Mazo */}
          <button
            onClick={() => cantarJugador('MAZO')}
            disabled={cpuPensando || manoTerminada || partidaFinalizada}
            className="bg-rose-700 hover:bg-rose-600 disabled:opacity-30 font-bold py-2 rounded-lg text-xs transition-all active:scale-95"
          >
            Mazo
          </button>
        </div>

        {/* Botón de Repartir */}
        <div className="mt-2">
          <button
            onClick={repartir}
            disabled={cpuPensando || !manoTerminada}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 font-bold py-2 rounded-lg text-xs active:scale-95 transition-all shadow"
          >
            {partidaFinalizada ? '🎮 Nueva Partida' : '🔄 Repartir Nueva Mano'}
          </button>
        </div>
      </div>
    </div>
  );
};