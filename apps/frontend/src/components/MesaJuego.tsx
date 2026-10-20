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
  onUsuarioActualizado?: (id: string) => void;
}

export const MesaJuego: React.FC<Props> = ({ usuarioActivo, onUsuarioActualizado }) => {
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

  // Apuestas
  const [estadoEnvido, setEstadoEnvido] = useState<EstadoCantoEnvido>('NADIE');
  const [ptsEnvidoEnJuego, setPtsEnvidoEnJuego] = useState(0);
  const [ptsEnvidoRechazo, setPtsEnvidoRechazo] = useState(1);
  const [envidoResuelto, setEnvidoResuelto] = useState(false);

  const [estadoTruco, setEstadoTruco] = useState<EstadoCantoTruco>('NADIE');
  const [ptsTrucoEnJuego, setPtsTrucoEnJuego] = useState(1);
  const [cantanteTruco, setCantanteTruco] = useState<'jugador' | 'cpu' | null>(null);

  const [apuestaPendiente, setApuestaPendiente] = useState<TipoCanto | null>(null);
  const [quienDebeResponder, setQuienDebeResponder] = useState<'jugador' | 'cpu' | null>(null);
  const [trucoEnPausaPorEnvido, setTrucoEnPausaPorEnvido] = useState<boolean>(false);

  // Turnos y Mensajes
  const [manoActual, setManoActual] = useState<'jugador' | 'cpu'>('jugador');
  const [turnoActual, setTurnoActual] = useState<'jugador' | 'cpu'>('jugador');
  const [cpuPensando, setCpuPensando] = useState(false);
  const [mensajeEstado, setMensajeEstado] = useState('Presiona "Iniciar Partida" para comenzar.');
  const [manoTerminada, setManoTerminada] = useState(true);
  const [partidaFinalizada, setPartidaFinalizada] = useState(false);
  const [partidaIniciada, setPartidaIniciada] = useState(false);

  // Métricas
  const [envidosQueridos, setEnvidosQueridos] = useState(0);
  const [envidosGanados, setEnvidosGanados] = useState(0);
  const [trucosQueridos, setTrucosQueridos] = useState(0);
  const [trucosGanados, setTrucosGanados] = useState(0);

  const [partidaGuardadaDetectada, setPartidaGuardadaDetectada] = useState<any | null>(null);

  const STORAGE_KEY = usuarioActivo
    ? `truco_partida_pendiente_${usuarioActivo.id}`
    : `truco_partida_pendiente_guest`;

  // 1. Verificar si existe partida guardada
  useEffect(() => {
    const dataGuardada = localStorage.getItem(STORAGE_KEY);
    if (dataGuardada) {
      try {
        const parsed = JSON.parse(dataGuardada);
        if (parsed.partidaIniciada && parsed.manoJugador && parsed.manoJugador.length > 0) {
          setPartidaGuardadaDetectada(parsed);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, [STORAGE_KEY]);

  // 2. Guardar estado en localStorage
  useEffect(() => {
    if (partidaFinalizada || !partidaIniciada || manoJugador.length === 0) {
      return;
    }

    const estadoPartida = {
      puntosJugador,
      puntosCpu,
      manoJugador,
      manoCpu,
      envidoJugador,
      envidoCpu,
      bazas,
      bazaActualIdx,
      estadoEnvido,
      ptsEnvidoEnJuego,
      ptsEnvidoRechazo,
      envidoResuelto,
      estadoTruco,
      ptsTrucoEnJuego,
      cantanteTruco,
      manoActual,
      turnoActual,
      manoTerminada,
      partidaIniciada: true,
      envidosQueridos,
      envidosGanados,
      trucosQueridos,
      trucosGanados,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(estadoPartida));
  }, [
    puntosJugador,
    puntosCpu,
    manoJugador,
    bazas,
    manoTerminada,
    STORAGE_KEY,
    partidaFinalizada,
    partidaIniciada,
  ]);

  const reanudarPartidaGuardada = () => {
    if (!partidaGuardadaDetectada) return;

    setPuntosJugador(partidaGuardadaDetectada.puntosJugador);
    setPuntosCpu(partidaGuardadaDetectada.puntosCpu);
    setManoJugador(partidaGuardadaDetectada.manoJugador);
    setManoCpu(partidaGuardadaDetectada.manoCpu);
    setEnvidoJugador(partidaGuardadaDetectada.envidoJugador);
    setEnvidoCpu(partidaGuardadaDetectada.envidoCpu);
    setBazas(partidaGuardadaDetectada.bazas);
    setBazaActualIdx(partidaGuardadaDetectada.bazaActualIdx);
    setEstadoEnvido(partidaGuardadaDetectada.estadoEnvido);
    setPtsEnvidoEnJuego(partidaGuardadaDetectada.ptsEnvidoEnJuego);
    setPtsEnvidoRechazo(partidaGuardadaDetectada.ptsEnvidoRechazo);
    setEnvidoResuelto(partidaGuardadaDetectada.envidoResuelto);
    setEstadoTruco(partidaGuardadaDetectada.estadoTruco);
    setPtsTrucoEnJuego(partidaGuardadaDetectada.ptsTrucoEnJuego);
    setCantanteTruco(partidaGuardadaDetectada.cantanteTruco);
    setManoActual(partidaGuardadaDetectada.manoActual);
    setTurnoActual(partidaGuardadaDetectada.turnoActual);
    setManoTerminada(partidaGuardadaDetectada.manoTerminada);
    setPartidaIniciada(true);

    setPartidaGuardadaDetectada(null);
    setMensajeEstado('▶️ Partida reanudada.');
  };

  const abandonarPartidaGuardada = async () => {
    localStorage.removeItem(STORAGE_KEY);

    if (usuarioActivo && partidaGuardadaDetectada) {
      try {
        await fetch(`http://localhost:3000/api/usuarios/${usuarioActivo.id}/partidas`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            resultado: 'DERROTA',
            puntosUsuario: partidaGuardadaDetectada.puntosJugador,
            puntosCpu: partidaGuardadaDetectada.puntosCpu,
            targetPuntos,
            conFlor: false,
            envidosQueridos: partidaGuardadaDetectada.envidosQueridos,
            envidosGanados: partidaGuardadaDetectada.envidosGanados,
            trucosQueridos: partidaGuardadaDetectada.trucosQueridos,
            trucosGanados: partidaGuardadaDetectada.trucosGanados,
          }),
        });

        if (onUsuarioActualizado) {
          onUsuarioActualizado(usuarioActivo.id);
        }
      } catch (e) {
        console.error('Error al registrar abandono:', e);
      }
    }

    setPartidaGuardadaDetectada(null);
    setPuntosJugador(0);
    setPuntosCpu(0);
    setManoJugador([]);
    setManoCpu([]);
    setBazas([{}, {}, {}]);
    setPartidaIniciada(false);
    setManoTerminada(true);
    setMensajeEstado('Partida abandonada. Presiona "Iniciar Partida".');
  };

  const guardarPartidaEnApi = async (ptsJ: number, ptsC: number) => {
    if (!usuarioActivo || partidaFinalizada) return;

    const esVictoria = ptsJ >= targetPuntos;
    setPartidaFinalizada(true);
    localStorage.removeItem(STORAGE_KEY);

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

      if (onUsuarioActualizado) {
        onUsuarioActualizado(usuarioActivo.id);
      }
    } catch (e) {
      console.error('Error al guardar la partida:', e);
    }
  };

  // REGLA 1: Tope de puntos para no exceder el máximo (30)
  const sumarPuntos = (jugador: 'jugador' | 'cpu', cantidad: number) => {
    if (jugador === 'jugador') {
      const nuevoPuntaje = Math.min(puntosJugador + cantidad, targetPuntos);
      setPuntosJugador(nuevoPuntaje);
      if (nuevoPuntaje >= targetPuntos) {
        setMensajeEstado(`🏆 ¡GANASTE LA PARTIDA! (${nuevoPuntaje} pts)`);
        setManoTerminada(true);
        guardarPartidaEnApi(nuevoPuntaje, puntosCpu);
      }
    } else {
      const nuevoPuntaje = Math.min(puntosCpu + cantidad, targetPuntos);
      setPuntosCpu(nuevoPuntaje);
      if (nuevoPuntaje >= targetPuntos) {
        setMensajeEstado(`💀 La CPU ganó la partida (${nuevoPuntaje} pts).`);
        setManoTerminada(true);
        guardarPartidaEnApi(puntosJugador, nuevoPuntaje);
      }
    }
  };

  const repartir = () => {
    if (!partidaIniciada || partidaFinalizada) {
      setPuntosJugador(0);
      setPuntosCpu(0);
      setPartidaFinalizada(false);
      setPartidaIniciada(true);
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

    setEstadoEnvido('NADIE');
    setPtsEnvidoEnJuego(0);
    setPtsEnvidoRechazo(1);
    setEnvidoResuelto(false);
    setEstadoTruco('NADIE');
    setPtsTrucoEnJuego(1);
    setCantanteTruco(null);
    setApuestaPendiente(null);
    setQuienDebeResponder(null);
    setTrucoEnPausaPorEnvido(false);

    const siguienteMano = manoActual === 'jugador' ? 'cpu' : 'jugador';
    setManoActual(siguienteMano);
    setTurnoActual(siguienteMano);

    setMensajeEstado(`Mano repartida. Es mano: ${siguienteMano === 'jugador' ? 'Tú' : 'CPU'}.`);
  };

  // Turno de la CPU
  useEffect(() => {
    if (
      cpuPensando ||
      manoTerminada ||
      partidaFinalizada ||
      partidaGuardadaDetectada ||
      !partidaIniciada
    )
      return;

    if (quienDebeResponder === 'cpu' && apuestaPendiente) {
      responderCpuApuesta();
    } else if (turnoActual === 'cpu' && !quienDebeResponder && manoCpu.length > 0) {
      const bazaActual = bazas[bazaActualIdx];
      if (!bazaActual?.cpu) {
        const rand = Math.random();

        // CPU canta Envido si es 1a baza, no se resolvió, no jugó su carta y NO hay Truco aceptado
        if (
          bazaActualIdx === 0 &&
          !envidoResuelto &&
          estadoEnvido === 'NADIE' &&
          manoCpu.length === 3 &&
          ptsTrucoEnJuego === 1
        ) {
          if (envidoCpu >= 28 || (envidoCpu >= 24 && rand < 0.6)) {
            ejecutarCantoCpu(envidoCpu >= 30 && rand < 0.4 ? 'REAL_ENVIDO' : 'ENVIDO');
            return;
          }
        }

        // Canto de Truco por la CPU
        if (estadoTruco === 'NADIE' && cantanteTruco !== 'cpu' && rand < 0.3) {
          ejecutarCantoCpu('TRUCO');
          return;
        }

        ejecutarTurnoCpu(manoCpu, bazas, bazaActualIdx);
      }
    }
  }, [
    turnoActual,
    quienDebeResponder,
    apuestaPendiente,
    bazaActualIdx,
    manoTerminada,
    partidaFinalizada,
    partidaGuardadaDetectada,
    partidaIniciada,
  ]);

  const ejecutarCantoCpu = (canto: TipoCanto) => {
    setCpuPensando(true);
    setTimeout(() => {
      setCpuPensando(false);

      if (
        canto === 'ENVIDO' ||
        canto === 'ENVIDO_ENVIDO' ||
        canto === 'REAL_ENVIDO' ||
        canto === 'FALTA_ENVIDO'
      ) {
        const res = procesarCantoEnvido(
          estadoEnvido,
          canto as any,
          puntosCpu,
          puntosJugador,
          targetPuntos
        );
        setEstadoEnvido(res.nuevoEstado);
        setPtsEnvidoEnJuego(res.enJuego);
        setPtsEnvidoRechazo(res.rechazo);
        setApuestaPendiente(canto);
        setQuienDebeResponder('jugador');
        const msj = canto === 'ENVIDO_ENVIDO' ? 'ENVIDO ENVIDO' : canto.replace('_', ' ');
        setMensajeEstado(`🤖 CPU canta ${msj}. ¿Qué respondes?`);
      } else if (canto === 'TRUCO' || canto === 'RETRUCO' || canto === 'VALE_CUATRO') {
        setEstadoTruco(canto as EstadoCantoTruco);
        setCantanteTruco('cpu');
        setApuestaPendiente(canto);
        setQuienDebeResponder('jugador');
        setMensajeEstado(`🤖 CPU canta ${canto}. ¿Aceptas?`);
      }
    }, 1200);
  };

  const responderCpuApuesta = () => {
    setCpuPensando(true);
    setTimeout(() => {
      setCpuPensando(false);

      if (
        apuestaPendiente === 'ENVIDO' ||
        apuestaPendiente === 'ENVIDO_ENVIDO' ||
        apuestaPendiente === 'REAL_ENVIDO' ||
        apuestaPendiente === 'FALTA_ENVIDO'
      ) {
        setEnvidosQueridos((v) => v + 1);

        if (envidoCpu >= 27 && estadoEnvido === 'ENVIDO') {
          ejecutarCantoCpu('ENVIDO_ENVIDO');
          return;
        } else if (envidoCpu >= 29 && (estadoEnvido === 'ENVIDO' || estadoEnvido === 'ENVIDO_ENVIDO')) {
          ejecutarCantoCpu('REAL_ENVIDO');
          return;
        } else if (envidoCpu >= 31 && estadoEnvido !== 'FALTA_ENVIDO') {
          ejecutarCantoCpu('FALTA_ENVIDO');
          return;
        }

        const acepta = envidoCpu >= 23 || Math.random() < 0.3;

        if (acepta) {
          setEnvidoResuelto(true);
          let msjEnvido = ``;
          if (
            envidoJugador > envidoCpu ||
            (envidoJugador === envidoCpu && manoActual === 'jugador')
          ) {
            setEnvidosGanados((v) => v + 1);
            msjEnvido = `🎉 Ganaste el Envido (+${ptsEnvidoEnJuego} pts). Tu ${envidoJugador} le gana a${envidoCpu}.`;
            sumarPuntos('jugador', ptsEnvidoEnJuego);
          } else {
            msjEnvido = `🤖 CPU gana el Envido (+${ptsEnvidoEnJuego} pts). Su ${envidoCpu} le gana a tu${envidoJugador}.`;
            sumarPuntos('cpu', ptsEnvidoEnJuego);
          }

          if (trucoEnPausaPorEnvido) {
            setApuestaPendiente('TRUCO');
            setQuienDebeResponder('cpu');
            setTrucoEnPausaPorEnvido(false);
            setMensajeEstado(`${msjEnvido} Ahora respondo a tu TRUCO...`);
          } else {
            setApuestaPendiente(null);
            setQuienDebeResponder(null);
            setMensajeEstado(msjEnvido);
          }
        } else {
          let msjEnvido = `🤖 CPU dice: "No Quiero". (+${ptsEnvidoRechazo} pt para ti).`;
          setEnvidosGanados((v) => v + 1);
          sumarPuntos('jugador', ptsEnvidoRechazo);
          setEnvidoResuelto(true);

          if (trucoEnPausaPorEnvido) {
            setApuestaPendiente('TRUCO');
            setQuienDebeResponder('cpu');
            setTrucoEnPausaPorEnvido(false);
            setMensajeEstado(`${msjEnvido} Ahora respondo a tu TRUCO...`);
          } else {
            setApuestaPendiente(null);
            setQuienDebeResponder(null);
            setMensajeEstado(msjEnvido);
          }
        }
      } else if (
        apuestaPendiente === 'TRUCO' ||
        apuestaPendiente === 'RETRUCO' ||
        apuestaPendiente === 'VALE_CUATRO'
      ) {
        setTrucosQueridos((v) => v + 1);

        const rand = Math.random();
        if (rand < 0.25 && apuestaPendiente === 'TRUCO') {
          ejecutarCantoCpu('RETRUCO');
          return;
        } else if (rand < 0.2 && apuestaPendiente === 'RETRUCO') {
          ejecutarCantoCpu('VALE_CUATRO');
          return;
        }

        const acepta = rand > 0.3;

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

  const cantarEnvidoSobreTruco = (canto: TipoCanto) => {
    setTrucoEnPausaPorEnvido(true);
    const res = procesarCantoEnvido(
      estadoEnvido,
      canto as any,
      puntosJugador,
      puntosCpu,
      targetPuntos
    );
    setEstadoEnvido(res.nuevoEstado);
    setPtsEnvidoEnJuego(res.enJuego);
    setPtsEnvidoRechazo(res.rechazo);
    setApuestaPendiente(canto);
    setQuienDebeResponder('cpu');
    const msj = canto === 'ENVIDO_ENVIDO' ? 'ENVIDO ENVIDO' : canto.replace('_', ' ');
    setMensajeEstado(`¡El Envido está primero! Cantaste ${msj}. Esperando respuesta de la CPU...`);
  };

  const responderJugador = (quiere: boolean, subirApuesta?: TipoCanto) => {
    if (quienDebeResponder !== 'jugador' || !apuestaPendiente) return;

    if (subirApuesta) {
      cantarJugador(subirApuesta);
      return;
    }

    if (
      apuestaPendiente === 'ENVIDO' ||
      apuestaPendiente === 'ENVIDO_ENVIDO' ||
      apuestaPendiente === 'REAL_ENVIDO' ||
      apuestaPendiente === 'FALTA_ENVIDO'
    ) {
      if (quiere) {
        setEnvidoResuelto(true);
        let msj = ``;
        if (
          envidoJugador > envidoCpu ||
          (envidoJugador === envidoCpu && manoActual === 'jugador')
        ) {
          msj = `🎉 Ganaste el Envido (+${ptsEnvidoEnJuego} pts). Tu ${envidoJugador} le gana a ${envidoCpu}.`;
          sumarPuntos('jugador', ptsEnvidoEnJuego);
        } else {
          msj = `🤖 CPU gana el Envido (+${ptsEnvidoEnJuego} pts). Su ${envidoCpu} le gana a tu ${envidoJugador}.`;
          sumarPuntos('cpu', ptsEnvidoEnJuego);
        }

        if (trucoEnPausaPorEnvido) {
          setApuestaPendiente('TRUCO');
          setQuienDebeResponder('jugador');
          setTrucoEnPausaPorEnvido(false);
          setMensajeEstado(`${msj} Ahora debes responder al TRUCO pendiente de la CPU.`);
        } else {
          setApuestaPendiente(null);
          setQuienDebeResponder(null);
          setMensajeEstado(msj);
        }
      } else {
        let msj = `Dijiste: "No Quiero". (+${ptsEnvidoRechazo} pt para la CPU).`;
        sumarPuntos('cpu', ptsEnvidoRechazo);
        setEnvidoResuelto(true);

        if (trucoEnPausaPorEnvido) {
          setApuestaPendiente('TRUCO');
          setQuienDebeResponder('jugador');
          setTrucoEnPausaPorEnvido(false);
          setMensajeEstado(`${msj} Ahora debes responder al TRUCO pendiente de la CPU.`);
        } else {
          setApuestaPendiente(null);
          setQuienDebeResponder(null);
          setMensajeEstado(msj);
        }
      }
    } else if (
      apuestaPendiente === 'TRUCO' ||
      apuestaPendiente === 'RETRUCO' ||
      apuestaPendiente === 'VALE_CUATRO'
    ) {
      if (quiere) {
        setMensajeEstado(`Dijiste "¡Quiero!" al ${apuestaPendiente}.`);
        setPtsTrucoEnJuego(
          apuestaPendiente === 'TRUCO' ? 2 : apuestaPendiente === 'RETRUCO' ? 3 : 4
        );
        setApuestaPendiente(null);
        setQuienDebeResponder(null);
      } else {
        setMensajeEstado(`Dijiste "No Quiero". La CPU gana la mano (+${ptsTrucoEnJuego} pt).`);
        sumarPuntos('cpu', ptsTrucoEnJuego);
        setManoTerminada(true);
        setApuestaPendiente(null);
        setQuienDebeResponder(null);
      }
    }
  };

  const cantarJugador = (canto: TipoCanto) => {
    if (cpuPensando || manoTerminada || partidaFinalizada || partidaGuardadaDetectada) return;

    if (
      canto === 'ENVIDO' ||
      canto === 'ENVIDO_ENVIDO' ||
      canto === 'REAL_ENVIDO' ||
      canto === 'FALTA_ENVIDO'
    ) {
      const res = procesarCantoEnvido(
        estadoEnvido,
        canto as any,
        puntosJugador,
        puntosCpu,
        targetPuntos
      );
      setEstadoEnvido(res.nuevoEstado);
      setPtsEnvidoEnJuego(res.enJuego);
      setPtsEnvidoRechazo(res.rechazo);
      setApuestaPendiente(canto);
      setQuienDebeResponder('cpu');
      const msj = canto === 'ENVIDO_ENVIDO' ? 'ENVIDO ENVIDO' : canto.replace('_', ' ');
      setMensajeEstado(`Cantaste ${msj}. Esperando respuesta de la CPU...`);
    } else if (canto === 'TRUCO' || canto === 'RETRUCO' || canto === 'VALE_CUATRO') {
      setEstadoTruco(canto as EstadoCantoTruco);
      setCantanteTruco('jugador');
      setApuestaPendiente(canto);
      setQuienDebeResponder('cpu');
      setMensajeEstado(`Cantaste ${canto}! Esperando respuesta de la CPU...`);
    } else if (canto === 'MAZO') {
      setMensajeEstado(`Te fuiste al mazo. CPU suma +${ptsTrucoEnJuego} pt.`);
      sumarPuntos('cpu', ptsTrucoEnJuego);
      setManoTerminada(true);
    }
  };

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
      partidaFinalizada ||
      partidaGuardadaDetectada ||
      !partidaIniciada
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

  // REGLA 2: Permitir Envido sobre Truco solo si no se jugo carta Y si el Truco todavía NO fue querido (ptsTrucoEnJuego === 1)
  const permiteEnvidoSobreTruco =
    apuestaPendiente === 'TRUCO' &&
    bazaActualIdx === 0 &&
    !envidoResuelto &&
    manoJugador.length === 3 &&
    ptsTrucoEnJuego === 1 &&
    (estadoEnvido === 'NADIE' || estadoEnvido === 'ENVIDO' || estadoEnvido === 'ENVIDO_ENVIDO');

  return (
    <div className="max-w-md mx-auto p-4 bg-slate-900 min-h-screen text-slate-100 flex flex-col justify-between select-none relative">
      {partidaGuardadaDetectada && (
        <div className="absolute inset-0 bg-slate-950/90 z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 border-2 border-amber-500/60 p-5 rounded-2xl text-center shadow-2xl max-w-xs w-full">
            <span className="text-4xl block mb-2">🃏</span>
            <h2 className="text-lg font-black text-amber-400 mb-1">Partida en Curso</h2>
            <p className="text-xs text-slate-300 mb-4">
              Tenés una partida sin terminar ({partidaGuardadaDetectada.puntosJugador} pts vs CPU {partidaGuardadaDetectada.puntosCpu} pts).
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={reanudarPartidaGuardada}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow"
              >
                ▶️ Reanudar Partida
              </button>
              <button
                onClick={abandonarPartidaGuardada}
                className="bg-rose-800/80 hover:bg-rose-700 text-rose-200 font-bold py-2 rounded-xl text-xs transition-all"
              >
                🚫 Abandonar (Registra Derrota)
              </button>
            </div>
          </div>
        </div>
      )}

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
                partidaFinalizada ||
                partidaGuardadaDetectada ||
                !partidaIniciada
              }
              className="flex-1 bg-slate-800 hover:bg-slate-700 active:scale-95 disabled:opacity-40 p-2.5 rounded-xl border-2 border-slate-600 flex flex-col items-center shadow transition-all"
            >
              <span className="text-lg font-bold text-amber-400">{carta.numero}</span>
              <span className="text-xs text-slate-300 capitalize">{carta.palo}</span>
            </button>
          ))}
        </div>

        {/* Panel de Respuesta cuando la CPU canta */}
        {quienDebeResponder === 'jugador' && apuestaPendiente ? (
          <div className="bg-slate-800 p-2.5 rounded-xl border-2 border-amber-500 mb-2">
            <p className="text-xs text-center font-bold text-amber-300 mb-2">
              🤖 CPU cantó {apuestaPendiente.replace('_', ' ')}. ¿Qué respondes?
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => responderJugador(true)}
                className="bg-emerald-600 hover:bg-emerald-500 font-bold py-2 rounded-lg text-xs"
              >
                ¡Quiero!
              </button>

              <button
                onClick={() => responderJugador(false)}
                className="bg-rose-700 hover:bg-rose-600 font-bold py-2 rounded-lg text-xs"
              >
                No Quiero
              </button>

              {/* REGLA 2: Opciones de Envido solo si no jugó carta Y el Truco no fue arreglado aún */}
              {permiteEnvidoSobreTruco && (
                <>
                  <button
                    onClick={() => cantarEnvidoSobreTruco('ENVIDO')}
                    className="col-span-2 bg-indigo-600 hover:bg-indigo-500 font-bold py-2 rounded-lg text-xs"
                  >
                    Envido
                  </button>
                  <button
                    onClick={() => cantarEnvidoSobreTruco('REAL_ENVIDO')}
                    className="col-span-2 bg-indigo-700 hover:bg-indigo-600 font-bold py-2 rounded-lg text-xs"
                  >
                    Real Envido
                  </button>
                  <button
                    onClick={() => cantarEnvidoSobreTruco('FALTA_ENVIDO')}
                    className="col-span-2 bg-purple-700 hover:bg-purple-600 font-bold py-2 rounded-lg text-xs"
                  >
                    Falta Envido
                  </button>
                </>
              )}

              {/* REGLA 3: Sin texto adicional estilo (+4) */}
              {apuestaPendiente === 'ENVIDO' && estadoEnvido === 'ENVIDO' && (
                <button
                  onClick={() => responderJugador(true, 'ENVIDO_ENVIDO')}
                  className="col-span-2 bg-indigo-600 hover:bg-indigo-500 font-bold py-2 rounded-lg text-xs"
                >
                  Envido Envido
                </button>
              )}
              {(apuestaPendiente === 'ENVIDO' || apuestaPendiente === 'ENVIDO_ENVIDO') && (
                <button
                  onClick={() => responderJugador(true, 'REAL_ENVIDO')}
                  className="col-span-2 bg-indigo-600 hover:bg-indigo-500 font-bold py-2 rounded-lg text-xs"
                >
                  Real Envido
                </button>
              )}
              {(apuestaPendiente === 'ENVIDO' ||
                apuestaPendiente === 'ENVIDO_ENVIDO' ||
                apuestaPendiente === 'REAL_ENVIDO') && (
                <button
                  onClick={() => responderJugador(true, 'FALTA_ENVIDO')}
                  className="col-span-2 bg-purple-700 hover:bg-purple-600 font-bold py-2 rounded-lg text-xs"
                >
                  Falta Envido
                </button>
              )}

              {/* Opciones progresivas para redoblar Truco */}
              {apuestaPendiente === 'TRUCO' && (
                <button
                  onClick={() => responderJugador(true, 'RETRUCO')}
                  className="col-span-2 bg-amber-600 hover:bg-amber-500 font-bold py-2 rounded-lg text-xs"
                >
                  Retruco
                </button>
              )}
              {apuestaPendiente === 'RETRUCO' && (
                <button
                  onClick={() => responderJugador(true, 'VALE_CUATRO')}
                  className="col-span-2 bg-amber-600 hover:bg-amber-500 font-bold py-2 rounded-lg text-xs"
                >
                  Vale Cuatro
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Botonera Dinámica habitual */
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() =>
                cantarJugador(
                  estadoEnvido === 'NADIE'
                    ? 'ENVIDO'
                    : estadoEnvido === 'ENVIDO'
                    ? 'ENVIDO_ENVIDO'
                    : estadoEnvido === 'ENVIDO_ENVIDO'
                    ? 'REAL_ENVIDO'
                    : 'FALTA_ENVIDO'
                )
              }
              disabled={
                bazaActualIdx > 0 ||
                envidoResuelto ||
                cpuPensando ||
                manoTerminada ||
                quienDebeResponder !== null ||
                manoJugador.length < 3 || // No se puede cantar si ya tiro carta
                ptsTrucoEnJuego > 1 || // No se puede cantar si el truco ya esta querido
                partidaFinalizada ||
                partidaGuardadaDetectada ||
                !partidaIniciada
              }
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 font-bold py-2 rounded-lg text-xs transition-all active:scale-95"
            >
              {estadoEnvido === 'NADIE'
                ? 'Envido'
                : estadoEnvido === 'ENVIDO'
                ? 'Envido Envido'
                : estadoEnvido === 'ENVIDO_ENVIDO'
                ? 'Real Envido'
                : 'Falta Envido'}
            </button>

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
                partidaFinalizada ||
                partidaGuardadaDetectada ||
                !partidaIniciada
              }
              className="bg-amber-600 hover:bg-amber-500 disabled:opacity-30 font-bold py-2 rounded-lg text-xs transition-all active:scale-95"
            >
              {estadoTruco === 'NADIE'
                ? 'Truco'
                : estadoTruco === 'TRUCO'
                ? 'Retruco'
                : 'Vale Cuatro'}
            </button>

            <button
              onClick={() => cantarJugador('MAZO')}
              disabled={
                cpuPensando ||
                manoTerminada ||
                partidaFinalizada ||
                partidaGuardadaDetectada ||
                !partidaIniciada
              }
              className="bg-rose-700 hover:bg-rose-600 disabled:opacity-30 font-bold py-2 rounded-lg text-xs transition-all active:scale-95"
            >
              Mazo
            </button>
          </div>
        )}

        {/* Botón de Iniciar / Repartir */}
        <div className="mt-2">
          <button
            onClick={repartir}
            disabled={cpuPensando || (!manoTerminada && partidaIniciada) || partidaGuardadaDetectada}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 font-bold py-2 rounded-lg text-xs active:scale-95 transition-all shadow"
          >
            {!partidaIniciada
              ? '🎮 Iniciar Partida'
              : partidaFinalizada
              ? '🎮 Nueva Partida'
              : '🔄 Repartir Nueva Mano'}
          </button>
        </div>
      </div>
    </div>
  );
};