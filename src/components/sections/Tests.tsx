import { useState } from 'react';
import { testModules } from '../../data/tests';
import { supabase } from '../../lib/supabase';

export default function Tests() {
  const [testActivo, setTestActivo] = useState<typeof testModules[0] | null>(null);
  const [pasoTest, setPasoTest] = useState(0);
  const [respuestasTest, setRespuestasTest] = useState<number[]>([]);
  const [emailTest, setEmailTest] = useState('');
  const [resultadoTest, setResultadoTest] = useState<{ test: string; score: string } | null>(null);

  const inputClass = "w-full bg-[#252525] border border-[#333] text-white px-4 py-2.5 rounded-lg focus:outline-none focus:border-[#E6CA65] text-base mt-1";

  const iniciarTest = (test: typeof testModules[0]) => {
    setTestActivo(test);
    setPasoTest(0);
    setRespuestasTest([]);
    setResultadoTest(null);
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

      const { error: rpcError } = await supabase.rpc('update_test_results', { p_email: emailTest, p_result: resultadoFinal });
      if (rpcError) {
        const { data } = await supabase.from('candidates').select('id, test_results').eq('email', emailTest).single();
        if (data) {
          const updated = [...(data.test_results || []), resultadoFinal];
          await supabase.from('candidates').update({ test_results: updated }).eq('id', data.id);
        }
      }

      setResultadoTest(resultadoFinal);
    }
  };

  const cerrarTest = () => { setTestActivo(null); setResultadoTest(null); };

  if (testActivo) {
    if (resultadoTest) {
      return (
        <div className="w-full space-y-6">
          <div className="bg-[#1A1A1A] p-8 rounded-xl border border-[#E6CA65]/40 text-center flex flex-col items-center gap-4 shadow-2xl">
            <div className="w-20 h-20 rounded-full bg-[#E6CA65]/10 flex items-center justify-center text-[#E6CA65] text-5xl border border-[#E6CA65]/30">✓</div>
            <h3 className="text-xl font-bold text-white">Test Completado</h3>
            <p className="text-gray-300">Tu puntaje para <strong className="text-[#E6CA65]">{testActivo.titulo}</strong> es:</p>
            <p className="text-3xl font-extrabold text-[#E6CA65]">{resultadoTest.score}</p>
            <p className="text-xs text-gray-500">Gracias por completar el test de CV Consultora.</p>
            <button onClick={cerrarTest} className="mt-4 bg-[#252525] text-gray-200 border border-[#444] font-bold py-2 px-8 rounded-lg hover:bg-[#333] transition text-sm">Volver a Tests</button>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full space-y-6">
        <div className="bg-[#1A1A1A] p-8 rounded-xl border border-[#2A2A2A] shadow-lg">
          <h3 className="text-xl font-bold text-[#E6CA65] mb-2">{testActivo.titulo}</h3>
          <p className="text-xs text-gray-500 mb-6">Pregunta {pasoTest + 1} de {testActivo.preguntas.length}</p>

          {pasoTest === 0 && (
            <div className="mb-6 pb-6 border-b border-[#333]">
              <label className="form-label">Email o DNI (Para vincular el resultado a tu perfil)</label>
              <input type="text" value={emailTest} onChange={e => setEmailTest(e.target.value)} className={inputClass} placeholder="ejemplo@email.com o 30111222" required />
            </div>
          )}

          <p className="text-lg text-white mb-6 font-medium">{testActivo.preguntas[pasoTest].p}</p>
          <div className="space-y-3">
            {testActivo.preguntas[pasoTest].r.map((opcion, i) => (
              <button key={i} onClick={() => enviarRespuestaTest(i)}
                className="w-full text-left p-4 rounded-lg bg-[#252525] border border-[#444] hover:border-[#E6CA65] hover:bg-[#252525]/80 transition text-gray-200 text-base">
                {opcion}
              </button>
            ))}
          </div>
          <button onClick={cerrarTest} className="mt-6 text-xs text-red-400 hover:underline">Cancelar Test</button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="text-center">
        <span className="text-5xl">🧠</span>
        <h2 className="text-2xl font-bold text-[#E6CA65] mt-2">Evaluaciones Psicotécnicas</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {testModules.map(t => (
          <div key={t.id} className="bg-[#1A1A1A] p-6 rounded-xl border border-[#2A2A2A] flex flex-col justify-between shadow-lg">
            <div>
              <h4 className="font-bold text-white mb-2 text-lg">{t.titulo}</h4>
              <p className="text-sm text-gray-400">{t.desc}</p>
            </div>
            <button onClick={() => iniciarTest(t)}
              className="mt-4 bg-[#E6CA65] text-black font-bold py-2 px-6 rounded-lg text-sm hover:bg-[#d8bd58] flex items-center justify-center gap-2">
              🧠 Iniciar Test
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
