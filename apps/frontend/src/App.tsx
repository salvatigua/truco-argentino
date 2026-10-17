import { useState } from 'react';
import { Anotador } from './components/Anotador';
import { MesaJuego } from './components/MesaJuego';

export default function App() {
  const [vista, setVista] = useState<'mesa' | 'anotador'>('mesa');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Selector de Modos de Juego / Herramienta */}
      <div className="bg-slate-900 border-b border-slate-800 p-2 flex justify-center gap-2 max-w-md mx-auto">
        <button
          onClick={() => setVista('mesa')}
          className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-all ${
            vista === 'mesa'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          🃏 Partida vs CPU
        </button>
        <button
          onClick={() => setVista('anotador')}
          className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-all ${
            vista === 'anotador'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          📝 Anotador Físico
        </button>
      </div>

      {/* Renderizado condicional de la pantalla actual */}
      {vista === 'mesa' ? <MesaJuego /> : <Anotador />}
    </div>
  );
}