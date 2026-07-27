import { useState } from 'react';
import { CheckCircle, FlaskConical, ArrowRight, AlertCircle, RotateCcw, X } from 'lucide-react';
import { testModules } from '../../data/tests';
import { supabase } from '../../lib/supabase';

export default function Tests() {
  const [testActivo, setTestActivo] = useState<typeof testModules[0] | null>(null);
  const [pasoTest, setPasoTest] = useState(0);
  const [respuestasTest, setRespuestasTest] = useState<number[]>([]);
  const [emailTest, setEmailTest] = useState('');
  const [resultadoTest, setResultadoTest] = useState<{ test: string; score: string } | null>(null);
  const [testGuardado, setTestGuardado] = useState<boolean | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [cancelConfirm, setCancelConfirm] = useState(false);

  const inputClass = "w-full bg-[#252525] border border-[#333] text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-[#E6CA65] text-base mt-1 transition-colors duration-200";

  const validarEmail = (val: string): boolean => {
    if (!val.trim()) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const dniRegex = /^\d{7,8}$/;
    return emailRegex.test(val) || dniRegex.test(val);
  };

  const iniciarTest = (test: typeof testModules[0]) => {
    setTestActivo(test);
    setPasoTest(0);
    setRespuestasTest([]);
    setResultadoTest(null);
    setTestGuardado(null);
    setGuardando(false);
    setEmailTest('');
    setEmailError('');
    setCancelConfirm(false);
  };

  const enviarRespuestaTest = async (opcionIndex: number) => {
    if (!emailTest.trim()) {
      setEmailError('Ingresá tu email o DNI para vincular el resultado.');
      return;
    }
    if (!validarEmail(emailTest)) {
      setEmailError('Formato inválido. Ingresá un email (ej: tu@email.com) o DNI (7-8 dígitos).');
      return;
    }
    setEmailError('');

    const nuevasRespuestas = [...respuestasTest, opcionIndex];
    setRespuestasTest(nuevasRespuestas);

    if (pasoTest < testActivo!.preguntas.length - 1) {
      setPasoTest(pasoTest + 1);
    } else {
      let score = 0;
      nuevasRespuestas.forEach(r => { if (r === 0) score += 2; if (r === 1) score += 1; });
      const maxScore = testActivo!.preguntas.length * 2;
      const resultadoFinal = { test: testActivo!.titulo, score: `${score}/${maxScore}` };

      setGuardando(true);
      const { error: insertError } = await supabase.from('test_scores').insert({
        email: emailTest.trim(),
        test: resultadoFinal.test,
        score: resultadoFinal.score,
      });
      setGuardando(false);

      setResultadoTest(resultadoFinal);
      setTestGuardado(!insertError);
    }
  };

  const reintentarGuardado = async () => {
    if (!resultadoTest) return;
    setGuardando(true);
    const { error } = await supabase.from('test_scores').insert({
      email: emailTest.trim(),
      test: resultadoTest.test,
      score: resultadoTest.score,
    });
    setGuardando(false);
    if (!error) setTestGuardado(true);
  };

  const cerrarTest = () => {
    setTestActivo(null);
    setResultadoTest(null);
    setTestGuardado(null);
    setCancelConfirm(false);
  };

  const interpretarPuntaje = (score: string): { texto: string; color: string } => {
    const [actual, max] = score.split('/').map(Number);
    const pct = (actual / max) * 100;
    if (pct >= 80) return { texto: 'Excelente', color: 'text-emerald-400' };
    if (pct >= 60) return { texto: 'Bueno', color: 'text-[#E6CA65]' };
    if (pct >= 40) return { texto: 'Regular', color: 'text-orange-400' };
    return { texto: 'A mejorar', color: 'text-red-400' };
  };

  if (testActivo) {
    const totalPreguntas = testActivo.preguntas.length;
    const respondidas = respuestasTest.length;
    const progreso = (respondidas / totalPreguntas) * 100;

    if (resultadoTest) {
      const interpretacion = interpretarPuntaje(resultadoTest.score);
      return (
        <div className="w-full space-y-6">
          <div className="bg-[#1A1A1A] p-8 rounded-xl border border-[#E6CA65]/20 text-center flex flex-col items-center gap-4 shadow-2xl">
            <div className="w-20 h-20 rounded-full bg-[#E6CA65]/10 flex items-center justify-center border border-[#E6CA65]/20">
              <CheckCircle className="w-10 h-10 text-[#E6CA65]" />
            </div>
            <h3 className="text-xl font-bold text-white">Test Completado</h3>
            <p className="text-gray-300">Tu puntaje para <strong className="text-[#E6CA65]">{testActivo.titulo}</strong> es:</p>
            <p className="text-4xl font-extrabold text-[#E6CA65] glow-gold">{resultadoTest.score}</p>
            <p className={`text-sm font-semibold ${interpretacion.color}`}>{interpretacion.texto}</p>
            <p className="text-xs text-gray-500">Gracias por completar el test de CV Consultora.</p>

            {guardando && (
              <p className="text-xs text-gray-400 flex items-center gap-2">
                <svg className="animate-spin w-3 h-3" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                Guardando resultado...
              </p>
            )}

            {testGuardado === false && !guardando && (
              <div className="bg-amber-900/20 border border-amber-700/30 rounded-lg px-4 py-3 mt-2 space-y-2">
                <p className="text-xs text-amber-400">El resultado no pudo guardarse. Verificá que el email coincida con tu postulación.</p>
                <button onClick={reintentarGuardado} className="text-xs text-amber-300 underline hover:text-amber-200 flex items-center gap-1 mx-auto">
                  <RotateCcw className="w-3 h-3" /> Reintentar guardado
                </button>
              </div>
            )}

            <button onClick={cerrarTest} className="mt-4 bg-[#252525] text-gray-200 border border-[#444] font-bold py-2.5 px-8 rounded-lg hover:bg-[#333] hover:border-[#555] transition text-sm">Volver a Tests</button>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full space-y-6">
        <div className="bg-[#1A1A1A] p-6 sm:p-8 rounded-xl border border-[#2A2A2A] shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-bold text-[#E6CA65]">{testActivo.titulo}</h3>
            <span className="text-xs text-gray-500 font-medium">{respondidas} / {totalPreguntas}</span>
          </div>

          <div className="progress-bar mb-6">
            <div className="progress-bar-fill" style={{ width: `${progreso}%` }}></div>
          </div>

          {pasoTest === 0 && (
            <div className="mb-6 pb-6 border-b border-[#333]">
              <label className="form-label">Email o DNI (Para vincular el resultado a tu perfil)</label>
              <input type="text" value={emailTest} onChange={e => { setEmailTest(e.target.value); if (emailError) setEmailError(''); }}
                className={inputClass + (emailError ? ' border-red-500' : '')} placeholder="ejemplo@email.com o 30111222" />
              {emailError && (
                <p className="text-xs text-red-400 flex items-center gap-1 mt-1.5"><AlertCircle className="w-3 h-3" /> {emailError}</p>
              )}
            </div>
          )}

          <p className="text-lg text-white mb-6 font-medium leading-relaxed">{testActivo.preguntas[pasoTest].p}</p>
          <div className="space-y-3">
            {testActivo.preguntas[pasoTest].r.map((opcion, i) => (
              <button key={i} onClick={() => enviarRespuestaTest(i)}
                className="w-full text-left p-4 rounded-lg bg-[#252525] border border-[#444] hover:border-[#E6CA65] hover:bg-[#E6CA65]/5 transition-all duration-200 text-gray-200 text-base flex items-center justify-between group">
                <span>{opcion}</span>
                <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-[#E6CA65] transition-colors" />
              </button>
            ))}
          </div>

          {cancelConfirm ? (
            <div className="mt-6 flex items-center gap-3 justify-center">
              <span className="text-xs text-gray-400">¿Cancelar test? Se perderán las respuestas.</span>
              <button onClick={cerrarTest} className="text-xs text-red-400 border border-red-800/50 px-3 py-1.5 rounded-lg hover:bg-red-900/20">Sí, cancelar</button>
              <button onClick={() => setCancelConfirm(false)} className="text-xs text-gray-400 hover:text-white transition-colors">Seguir</button>
            </div>
          ) : (
            <button onClick={() => setCancelConfirm(true)} className="mt-6 text-xs text-gray-500 hover:text-red-400 transition-colors">Cancelar Test</button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="text-center">
        <FlaskConical className="w-12 h-12 text-[#E6CA65] mx-auto mb-3" />
        <h2 className="text-2xl font-bold text-[#E6CA65]">Evaluaciones Psicotécnicas</h2>
        <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">Evaluá tus competencias con nuestros tests psicotécnicos. Los resultados se vinculan a tu perfil de postulación.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {testModules.map(t => (
          <div key={t.id} className="content-card bg-[#1A1A1A] p-6 rounded-xl border border-[#2A2A2A] flex flex-col justify-between shadow-lg">
            <div>
              <h4 className="font-bold text-white mb-2 text-lg">{t.titulo}</h4>
              <p className="text-sm text-gray-400 leading-relaxed">{t.desc}</p>
              <p className="text-xs text-gray-600 mt-2">{t.preguntas.length} preguntas</p>
            </div>
            <button onClick={() => iniciarTest(t)}
              className="mt-4 bg-[#E6CA65] text-black font-bold py-2.5 px-6 rounded-lg text-sm hover:bg-[#d8bd58] flex items-center justify-center gap-2 transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-[#E6CA65]/10">
              <FlaskConical className="w-4 h-4" /> Iniciar Test
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
