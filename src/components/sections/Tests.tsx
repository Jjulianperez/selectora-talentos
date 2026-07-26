import { useState } from 'react';
import { CheckCircle, FlaskConical, ClipboardList, ArrowRight } from 'lucide-react';
import { testModules } from '../../data/tests';
import { supabase } from '../../lib/supabase';

export default function Tests() {
  const [testActivo, setTestActivo] = useState<typeof testModules[0] | null>(null);
  const [pasoTest, setPasoTest] = useState(0);
  const [respuestasTest, setRespuestasTest] = useState<number[]>([]);
  const [emailTest, setEmailTest] = useState('');
  const [resultadoTest, setResultadoTest] = useState<{ test: string; score: string } | null>(null);
  const [testGuardado, setTestGuardado] = useState(true);

  const inputClass = "w-full bg-[#252525] border border-[#333] text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-[#E6CA65] text-base mt-1 transition-colors duration-200";

  const iniciarTest = (test: typeof testModules[0]) => {
    setTestActivo(test);
    setPasoTest(0);
    setRespuestasTest([]);
    setResultadoTest(null);
    setTestGuardado(true);
    setEmailTest('');
  };

  const enviarRespuestaTest = async (opcionIndex: number) => {
    if (!emailTest) {
      alert('Ingresa tu Email o DNI primero.');
      return;
    }
    const nuevasRespuestas = [...respuestasTest, opcionIndex];
    setRespuestasTest(nuevasRespuestas);

    if (pasoTest < testActivo!.preguntas.length - 1) {
      setPasoTest(pasoTest + 1);
    } else {
      let score = 0;
      nuevasRespuestas.forEach(r => { if (r === 0) score += 2; if (r === 1) score += 1; });
      const maxScore = testActivo!.preguntas.length * 2;
      const resultadoFinal = { test: testActivo!.titulo, score: `${score}/${maxScore}` };

      const { data: rpcOk, error: rpcError } = await supabase.rpc('update_test_results', { p_email: emailTest, p_result: resultadoFinal });
      if (rpcError || !rpcOk) {
        setResultadoTest(resultadoFinal);
        setTestGuardado(false);
      } else {
        setResultadoTest(resultadoFinal);
        setTestGuardado(true);
      }
    }
  };

  const cerrarTest = () => { setTestActivo(null); setResultadoTest(null); };

  if (testActivo) {
    const totalPreguntas = testActivo.preguntas.length;
    const progreso = ((pasoTest + 1) / totalPreguntas) * 100;

    if (resultadoTest) {
      return (
        <div className="w-full space-y-6">
          <div className="bg-[#1A1A1A] p-8 rounded-xl border border-[#E6CA65]/20 text-center flex flex-col items-center gap-4 shadow-2xl">
            <div className="w-20 h-20 rounded-full bg-[#E6CA65]/10 flex items-center justify-center border border-[#E6CA65]/20">
              <CheckCircle className="w-10 h-10 text-[#E6CA65]" />
            </div>
            <h3 className="text-xl font-bold text-white">Test Completado</h3>
            <p className="text-gray-300">Tu puntaje para <strong className="text-[#E6CA65]">{testActivo.titulo}</strong> es:</p>
            <p className="text-4xl font-extrabold text-[#E6CA65] glow-gold">{resultadoTest.score}</p>
            <p className="text-xs text-gray-500">Gracias por completar el test de CV Consultora.</p>
            {!testGuardado && (
              <p className="text-xs text-amber-400 bg-amber-900/20 border border-amber-700/30 rounded-lg px-3 py-2 mt-2">
                El resultado no pudo guardarse. Verificá que el email coincida con tu postulación.
              </p>
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
            <span className="text-xs text-gray-500 font-medium">{pasoTest + 1} / {totalPreguntas}</span>
          </div>

          <div className="progress-bar mb-6">
            <div className="progress-bar-fill" style={{ width: `${progreso}%` }}></div>
          </div>

          {pasoTest === 0 && (
            <div className="mb-6 pb-6 border-b border-[#333]">
              <label className="form-label">Email o DNI (Para vincular el resultado a tu perfil)</label>
              <input type="text" value={emailTest} onChange={e => setEmailTest(e.target.value)} className={inputClass} placeholder="ejemplo@email.com o 30111222" required />
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
          <button onClick={cerrarTest} className="mt-6 text-xs text-gray-500 hover:text-red-400 transition-colors">Cancelar Test</button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="text-center">
        <FlaskConical className="w-12 h-12 text-[#E6CA65] mx-auto mb-3" />
        <h2 className="text-2xl font-bold text-[#E6CA65]">Evaluaciones Psicotécnicas</h2>
        <p className="text-sm text-gray-400 mt-2 max-w-md mx-auto">Evaluá tus competencias con nuestros tests psicotécnicos. Los resultados se vinculan a tu perfil.</p>
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
