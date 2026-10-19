import { useState, useEffect } from 'react';
import { Anotador } from './components/Anotador';
import { MesaJuego } from './components/MesaJuego';
import { Perfil, Usuario } from './components/Perfil';

export default function App() {
  const [vista, setVista] = useState<'mesa' | 'anotador' | 'perfil'>('mesa');
  const [usuarioActivo, setUsuarioActivo] = useState<Usuario | null>(null);

  const refrescarUsuarioActivo = async (id: string) => {
    try {
      const res = await fetch('http://localhost:3000/api/usuarios');
      if (res.ok) {
        const usuarios: Usuario[] = await res.json();
        const encontrado = usuarios.find((u) => u.id === id);
        if (encontrado) setUsuarioActivo(encontrado);
      }
    } catch (e) {
      console.error('Error al refrescar usuario:', e);
    }
  };

  useEffect(() => {
    const lastUserId = localStorage.getItem('truco_usuario_activo_id');
    fetch('http://localhost:3000/api/usuarios')
      .then((res) => res.json())
      .then((usuarios: Usuario[]) => {
        if (usuarios.length > 0) {
          const encontrado = usuarios.find((u) => u.id === lastUserId);
          const seleccionado = encontrado || usuarios[0];
          setUsuarioActivo(seleccionado);
          localStorage.setItem('truco_usuario_activo_id', seleccionado.id);
        }
      })
      .catch(() => {});
  }, []);

  const handleSeleccionarUsuario = (u: Usuario) => {
    setUsuarioActivo(u);
    localStorage.setItem('truco_usuario_activo_id', u.id);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
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

      {vista === 'mesa' && (
        <MesaJuego
          usuarioActivo={usuarioActivo}
          onUsuarioActualizado={(id) => refrescarUsuarioActivo(id)}
        />
      )}
      {vista === 'anotador' && <Anotador />}
      {vista === 'perfil' && (
        <Perfil
          usuarioActivo={usuarioActivo}
          onSeleccionarUsuario={handleSeleccionarUsuario}
        />
      )}
    </div>
  );
}