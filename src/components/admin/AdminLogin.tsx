import { useState } from 'react';

export default function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;

    if (email === adminEmail && password === adminPassword) {
      onLogin();
      setError('');
    } else {
      setError('Credenciales incorrectas de administrador.');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-[#1A1A1A] rounded-2xl border border-[#2A2A2A] p-6 space-y-6 shadow-2xl">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-[#E6CA65]/10 text-[#E6CA65] rounded-full flex items-center justify-center mx-auto mb-2 text-2xl">🔒</div>
        <h3 className="text-xl font-bold text-white">Portal de Administración</h3>
        <p className="text-xs text-gray-400">Ingrese sus credenciales de CV Consultora</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Email de Usuario</label>
          <input type="email" required placeholder="consultoracv.sanluis@gmail.com"
            className="w-full bg-[#252525] border border-[#333] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#E6CA65]"
            value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Contraseña</label>
          <input type="password" required placeholder="••••••••"
            className="w-full bg-[#252525] border border-[#333] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#E6CA65]"
            value={password} onChange={e => setPassword(e.target.value)} />
        </div>

        {error && (
          <div className="p-3 bg-red-900/20 border border-red-800/50 rounded-lg flex items-center gap-2 text-xs text-red-400">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <button type="submit" className="w-full py-3 rounded-lg bg-[#E6CA65] hover:bg-[#d8bd58] text-black font-extrabold uppercase text-xs tracking-wider shadow-lg transition">
          Ingresar de Forma Segura
        </button>
      </form>

      <div className="border-t border-[#2A2A2A] pt-4 text-center">
        <span className="text-[10px] text-gray-500 block">
          Solo personal calificado de CV Consultora tiene acceso a la información de los postulantes.
        </span>
      </div>
    </div>
  );
}
