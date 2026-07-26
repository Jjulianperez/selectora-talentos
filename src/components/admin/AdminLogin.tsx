import { useState } from 'react';
import { Lock, AlertTriangle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export default function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;

    if (email !== adminEmail || password !== adminPassword) {
      setError('Credenciales incorrectas de administrador.');
      setLoading(false);
      return;
    }

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      if (authError.message.includes('Invalid login') || authError.message.includes('not found') || authError.message.includes('invalid')) {
        const { error: signUpError } = await supabase.auth.signUp({ email, password });
        if (signUpError) {
          if (signUpError.message.includes('already registered')) {
            setError('El usuario ya existe pero la contraseña es incorrecta.');
          } else if (signUpError.message.includes('confirm') || signUpError.message.includes('email')) {
            setError('El usuario fue creado. Revisá el email de confirmación de Supabase o desactivá la confirmación de email en Authentication → Providers → Email en el Dashboard de Supabase.');
          } else {
            setError(`Error al crear usuario: ${signUpError.message}`);
          }
          setLoading(false);
          return;
        }
        const { error: retryError } = await supabase.auth.signInWithPassword({ email, password });
        if (retryError) {
          setError('Usuario creado pero no se pudo iniciar sesión. Verificá el email de confirmación.');
          setLoading(false);
          return;
        }
      } else {
        setError(`Error de autenticación: ${authError.message}`);
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    onLogin();
  };

  return (
    <div className="max-w-md mx-auto bg-[#1A1A1A] rounded-2xl border border-[#2A2A2A] p-8 space-y-6 shadow-2xl shadow-black/30">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 bg-[#E6CA65]/10 rounded-full flex items-center justify-center mx-auto mb-2 border border-[#E6CA65]/15">
          <Lock className="w-6 h-6 text-[#E6CA65]" />
        </div>
        <h3 className="text-xl font-bold text-white">Portal de Administración</h3>
        <p className="text-xs text-gray-500">Ingrese sus credenciales de CV Consultora</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Email de Usuario</label>
          <input type="email" required placeholder="consultoracv.sanluis@gmail.com"
            className="w-full bg-[#252525] border border-[#333] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E6CA65] transition-colors duration-200"
            value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-300 uppercase mb-1">Contraseña</label>
          <input type="password" required placeholder="••••••••"
            className="w-full bg-[#252525] border border-[#333] rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#E6CA65] transition-colors duration-200"
            value={password} onChange={e => setPassword(e.target.value)} />
        </div>

        {error && (
          <div className="p-3 bg-red-900/15 border border-red-800/30 rounded-lg flex items-center gap-2 text-xs text-red-400">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button type="submit" disabled={loading}
          className="w-full py-3.5 rounded-lg bg-[#E6CA65] hover:bg-[#d8bd58] text-black font-extrabold uppercase text-xs tracking-wider shadow-lg shadow-[#E6CA65]/10 hover:shadow-[#E6CA65]/20 transition-all duration-200 disabled:opacity-50">
          {loading ? 'Verificando...' : 'Ingresar de Forma Segura'}
        </button>
      </form>

      <div className="border-t border-[#2A2A2A] pt-4 text-center">
        <span className="text-[10px] text-gray-600 block leading-relaxed">
          Solo personal calificado de CV Consultora tiene acceso a la información de los postulantes.
        </span>
      </div>
    </div>
  );
}
