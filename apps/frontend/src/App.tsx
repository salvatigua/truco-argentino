import { useState } from 'react';
import { Anotador } from './components/Anotador';
import { MesaJuego } from './components/MesaJuego';
import { Perfil, Usuario } from './components/Perfil';

export default function App() {
  const [vista, setVista] = useState<'mesa' | 'anotador' | 'perfil'>('mesa');
  const [usuarioActivo, setUsuarioActivo] = useState<Usuario | null>(null);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      {/* Selector de Navegación */}
      <div className="bg-slate-900 border-b border-slate-800 p-2 flex justify-center gap-2 max-w-md mx-auto">
        <button
          onClick={() => setVista('mesa')}
          className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-all ${
            vista === 'mesa'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          🃏 Mesa 1v1
        </button>

        <button
          onClick={() => setVista('anotador')}
          className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-all ${
            vista === 'anotador'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          📝 Anotador
        </button>

        <button
          onClick={() => setVista('perfil')}
          className={`flex-1 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-1 ${
            vista === 'perfil'
              ? 'bg-amber-500 text-slate-950 shadow'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
          }`}
        >
          👤 {usuarioActivo ? usuarioActivo.nombre : 'Perfil'}
        </button>
      </div>

      {/* Render de Vistas */}
      {vista === 'mesa' && <MesaJuego />}
      {vista === 'anotador' && <Anotador />}
      {vista === 'perfil' && (
        <Perfil
          usuarioActivo={usuarioActivo}
          onSeleccionarUsuario={(u) => setUsuarioActivo(u)}
        />
      )}
    </div>
  );
}