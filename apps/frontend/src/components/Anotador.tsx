import React, { useState } from 'react';

type PuntosTarget = 12 | 15 | 24 | 30;

export const Anotador: React.FC = () => {
  const [target, setTarget] = useState<PuntosTarget>(30);
  const [nosotros, setNosotros] = useState<number>(0);
  const [ellos, setEllos] = useState<number>(0);

  const esBuenasYMalas = target === 24 || target === 30;
  const limiteMalas = target / 2;

  const modificar = (equipo: 'nosotros' | 'ellos', delta: number) => {
    if (equipo === 'nosotros') {
      setNosotros((prev) => Math.min(Math.max(0, prev + delta), target));
    } else {
      setEllos((prev) => Math.min(Math.max(0, prev + delta), target));
    }
  };

  const reiniciar = () => {
    setNosotros(0);
    setEllos(0);
  };

  // Renderizador de palitos/fósforos estilizados
  const renderFosforos = (puntos: number) => {
    const bloques = Math.floor(puntos / 5);
    const resto = puntos % 5;
    const arrayBloques = Array.from({ length: bloques });

    return (
      <div className="flex flex-wrap justify-center gap-3 my-2 min-h-[120px] items-center">
        {arrayBloques.map((_, i) => (
          <div key={i} className="relative w-10 h-10 border-2 border-amber-600 rounded p-1 bg-amber-950/20 flex items-center justify-center font-bold text-amber-400">
            5
          </div>
        ))}
        {resto > 0 && (
          <div className="relative w-10 h-10 border-2 border-dashed border-amber-500/60 rounded flex items-center justify-center font-semibold text-amber-300">
            +{resto}
          </div>
        )}
      </div>
    );
  };

  const renderEtapa = (pts: number) => {
    if (!esBuenasYMalas) return null;
    return pts < limiteMalas ? (
      <span className="text-xs px-2 py-0.5 rounded bg-red-900/60 text-red-200 uppercase tracking-wider font-semibold">Malas</span>
    ) : (
      <span className="text-xs px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-200 uppercase tracking-wider font-semibold">Buenas</span>
    );
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-slate-900 min-h-screen text-slate-100 flex flex-col justify-between">
      {/* Selector de Puntos */}
      <div>
        <h1 className="text-2xl font-black text-center text-amber-400 mb-4 tracking-wide">
          📝 ANOTADOR DE TRUCO
        </h1>
        <div className="flex justify-center gap-2 mb-6">
          {([12, 15, 24, 30] as PuntosTarget[]).map((pts) => (
            <button
              key={pts}
              onClick={() => {
                setTarget(pts);
                reiniciar();
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                target === pts
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {pts} Pts
            </button>
          ))}
        </div>

        {/* Tablero de Puntajes */}
        <div className="grid grid-cols-2 gap-4 bg-slate-800/80 p-4 rounded-2xl border border-slate-700/50 shadow-xl">
          {/* Equipo Nosotros */}
          <div className="flex flex-col items-center bg-slate-900/60 p-3 rounded-xl border border-slate-700/30">
            <h2 className="text-lg font-bold text-emerald-400 mb-1">Nosotros</h2>
            {renderEtapa(nosotros)}
            <div className="text-5xl font-black text-white my-3">{nosotros}</div>
            {renderFosforos(nosotros)}
            <div className="flex gap-2 w-full mt-2">
              <button
                onClick={() => modificar('nosotros', -1)}
                className="flex-1 bg-red-600/80 hover:bg-red-600 active:scale-95 text-white font-bold py-3 rounded-lg text-xl transition-all shadow"
              >
                -1
              </button>
              <button
                onClick={() => modificar('nosotros', 1)}
                className="flex-1 bg-emerald-600/80 hover:bg-emerald-600 active:scale-95 text-white font-bold py-3 rounded-lg text-xl transition-all shadow"
              >
                +1
              </button>
            </div>
          </div>

          {/* Equipo Ellos */}
          <div className="flex flex-col items-center bg-slate-900/60 p-3 rounded-xl border border-slate-700/30">
            <h2 className="text-lg font-bold text-rose-400 mb-1">Ellos</h2>
            {renderEtapa(ellos)}
            <div className="text-5xl font-black text-white my-3">{ellos}</div>
            {renderFosforos(ellos)}
            <div className="flex gap-2 w-full mt-2">
              <button
                onClick={() => modificar('ellos', -1)}
                className="flex-1 bg-red-600/80 hover:bg-red-600 active:scale-95 text-white font-bold py-3 rounded-lg text-xl transition-all shadow"
              >
                -1
              </button>
              <button
                onClick={() => modificar('ellos', 1)}
                className="flex-1 bg-emerald-600/80 hover:bg-emerald-600 active:scale-95 text-white font-bold py-3 rounded-lg text-xl transition-all shadow"
              >
                +1
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Botón de Reinicio */}
      <div className="mt-6 mb-2">
        <button
          onClick={reiniciar}
          className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-3 rounded-xl border border-slate-700 active:scale-98 transition-all"
        >
          🔄 Reiniciar Partido
        </button>
      </div>
    </div>
  );
};