import React, { useState, useEffect } from 'react';

export interface Usuario {
  id: string;
  nombre: string;
  avatar: string;
  ultimoJuegoEn: string;
  partidasJugadas: number;
  partidasGanadas: number;
  envidosQueridos: number;
  envidosGanados: number;
  trucosQueridos: number;
  trucosGanados: number;
}

const AVATARES = [
  { id: 'gaucho', emoji: '🤠', etiqueta: 'Gaucho' },
  { id: 'paisana', emoji: '👩‍🌾', etiqueta: 'Paisana' },
  { id: 'mate', emoji: '🧉', etiqueta: 'Mate' },
  { id: 'sol', emoji: '☀️', etiqueta: 'Sol de Mayo' },
];

interface Props {
  usuarioActivo: Usuario | null;
  onSeleccionarUsuario: (usuario: Usuario) => void;
}

export const Perfil: React.FC<Props> = ({ usuarioActivo, onSeleccionarUsuario }) => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoAvatar, setNuevoAvatar] = useState('gaucho');
  const [editandoNombre, setEditandoNombre] = useState(false);
  const [nombreEditado, setNombreEditado] = useState('');
  const [cargando, setCargando] = useState(false);
  const [errorMsj, setErrorMsj] = useState('');

  const API_URL = 'http://localhost:3000/api/usuarios';

  // 1. Cargar lista de usuarios desde la API
  const cargarUsuarios = async () => {
    try {
      const res = await fetch(API_URL);
      if (res.ok) {
        const data = await res.json();
        setUsuarios(data);
        if (!usuarioActivo && data.length > 0) {
          onSeleccionarUsuario(data[0]);
        }
      }
    } catch {
      setErrorMsj('Error al conectar con la API para cargar usuarios.');
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  // 2. Crear nuevo usuario
  const crearUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre.trim()) return;

    setCargando(true);
    setErrorMsj('');

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre: nuevoNombre.trim(), avatar: nuevoAvatar }),
      });

      if (res.ok) {
        const usuarioCreado = await res.json();
        setNuevoNombre('');
        cargarUsuarios();
        onSeleccionarUsuario(usuarioCreado);
      } else {
        const errData = await res.json();
        setErrorMsj(errData.error || 'Error al crear usuario.');
      }
    } catch {
      setErrorMsj('Error de conexión al crear usuario.');
    } finally {
      setCargando(false);
    }
  };

  // 3. Actualizar perfil activo (Editar nombre / avatar)
  const guardarCambiosPerfil = async (avatarSeleccionado?: string) => {
    if (!usuarioActivo) return;

    try {
      const res = await fetch(`${API_URL}/${usuarioActivo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombreEditado.trim() || usuarioActivo.nombre,
          avatar: avatarSeleccionado || usuarioActivo.avatar,
        }),
      });

      if (res.ok) {
        const usuarioActualizado = await res.json();
        setEditandoNombre(false);
        cargarUsuarios();
        onSeleccionarUsuario(usuarioActualizado);
      }
    } catch {
      setErrorMsj('Error al actualizar el perfil.');
    }
  };

  const calcularPorcentajeVictorias = (u: Usuario) => {
    if (u.partidasJugadas === 0) return 0;
    return Math.round((u.partidasGanadas / u.partidasJugadas) * 100);
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-slate-900 min-h-screen text-slate-100 flex flex-col justify-between select-none">
      <div>
        <h1 className="text-2xl font-black text-center text-amber-400 mb-4 tracking-wide">
          👤 PERFIL Y ESTADÍSTICAS
        </h1>

        {errorMsj && (
          <div className="bg-red-900/60 border border-red-500 text-red-200 text-xs p-2 rounded-lg mb-4 text-center">
            {errorMsj}
          </div>
        )}

        {/* Seleccionar Usuario Activo */}
        {usuarios.length > 0 && (
          <div className="mb-6">
            <label className="text-xs text-slate-400 font-semibold mb-2 block">
              Seleccionar Jugador Activo:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {usuarios.map((u) => {
                const av = AVATARES.find((a) => a.id === u.avatar) || AVATARES[0];
                const esActivo = usuarioActivo?.id === u.id;
                return (
                  <button
                    key={u.id}
                    onClick={() => onSeleccionarUsuario(u)}
                    className={`p-3 rounded-xl border flex items-center gap-2 transition-all text-left ${
                      esActivo
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold shadow'
                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <span className="text-2xl">{av.emoji}</span>
                    <div className="truncate">
                      <p className="text-sm font-bold truncate">{u.nombre}</p>
                      <p className="text-[10px] text-slate-400">
                        {u.partidasGanadas}V / {u.partidasJugadas}P
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Crear Nuevo Perfil */}
        <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 mb-6">
          <h2 className="text-sm font-bold text-slate-300 mb-3">➕ Crear Nuevo Jugador</h2>
          <form onSubmit={crearUsuario} className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Nombre del Jugador"
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />

            <div>
              <span className="text-xs text-slate-400 block mb-1">Elegir Avatar:</span>
              <div className="flex justify-between gap-2">
                {AVATARES.map((av) => (
                  <button
                    type="button"
                    key={av.id}
                    onClick={() => setNuevoAvatar(av.id)}
                    className={`flex-1 p-2 rounded-lg border text-xl flex flex-col items-center gap-1 transition-all ${
                      nuevoAvatar === av.id
                        ? 'bg-amber-500/20 border-amber-500'
                        : 'bg-slate-900 border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    <span>{av.emoji}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={cargando || !nuevoNombre.trim()}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-lg text-xs disabled:opacity-50 transition-all shadow"
            >
              {cargando ? 'Creando...' : 'Crear Usuario'}
            </button>
          </form>
        </div>

        {/* Panel de Estadísticas del Usuario Activo */}
        {usuarioActivo && (
          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <span className="text-4xl">
                  {AVATARES.find((a) => a.id === usuarioActivo.avatar)?.emoji}
                </span>
                <div>
                  {editandoNombre ? (
                    <div className="flex gap-1 items-center">
                      <input
                        type="text"
                        defaultValue={usuarioActivo.nombre}
                        onChange={(e) => setNombreEditado(e.target.value)}
                        className="bg-slate-900 border border-amber-500 rounded px-2 py-1 text-xs text-white"
                      />
                      <button
                        onClick={() => guardarCambiosPerfil()}
                        className="bg-emerald-600 text-xs px-2 py-1 rounded font-bold"
                      >
                        ✓
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-black text-amber-400">
                        {usuarioActivo.nombre}
                      </h2>
                      <button
                        onClick={() => {
                          setEditandoNombre(true);
                          setNombreEditado(usuarioActivo.nombre);
                        }}
                        className="text-xs text-slate-400 hover:text-white"
                      >
                        ✏️
                      </button>
                    </div>
                  )}
                  <p className="text-[10px] text-slate-400">
                    Última jugada:{' '}
                    {new Date(usuarioActivo.ultimoJuegoEn).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Cambiar Avatar Rápido */}
              <div className="flex gap-1">
                {AVATARES.map((av) => (
                  <button
                    key={av.id}
                    onClick={() => guardarCambiosPerfil(av.id)}
                    className={`p-1 text-sm rounded ${
                      usuarioActivo.avatar === av.id ? 'bg-amber-500/30 border border-amber-400' : 'opacity-40'
                    }`}
                  >
                    {av.emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Malla de Métricas */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/50 text-center">
                <p className="text-xs text-slate-400 font-semibold">Partidas Ganadas</p>
                <p className="text-2xl font-black text-emerald-400">
                  {usuarioActivo.partidasGanadas} / {usuarioActivo.partidasJugadas}
                </p>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/50 text-center">
                <p className="text-xs text-slate-400 font-semibold">% Efectividad</p>
                <p className="text-2xl font-black text-amber-400">
                  {calcularPorcentajeVictorias(usuarioActivo)}%
                </p>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/50 text-center">
                <p className="text-xs text-slate-400 font-semibold">Envidos Ganados</p>
                <p className="text-xl font-bold text-indigo-300">
                  {usuarioActivo.envidosGanados} de {usuarioActivo.envidosQueridos}
                </p>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/50 text-center">
                <p className="text-xs text-slate-400 font-semibold">Trucos Ganados</p>
                <p className="text-xl font-bold text-amber-300">
                  {usuarioActivo.trucosGanados} de {usuarioActivo.trucosQueridos}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};