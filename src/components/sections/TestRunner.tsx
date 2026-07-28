import { useState } from 'react';
import { CheckCircle, FlaskConical, ArrowRight, ChevronLeft } from 'lucide-react';
import { testModules } from '../../data/tests';
import type { TestResult } from '../../lib/types';

interface TestResultDetail extends TestResult {
  respuestas: number[];
  interpretacion: string;
  fecha: string;
}

interface Props {
  existingResults?: TestResultDetail[];
  onComplete: (results: TestResultDetail[]) => void;
  onBack: () => void;
}

const interpretarPuntaje = (score: string): string => {
  const [actual, max] = score.split('/').map(Number);
  const pct = (actual / max) * 100;
  if (pct >= 80) return 'Excelente';
  if (pct >= 60) return 'Bueno';
  if (pct >= 40) return 'Regular';
  return 'A mejorar';
};

export default function TestRunner({ existingResults = [], onComplete, onBack }: Props) {
  const [resultados, setResultados] = useState<TestResultDetail[]>(existingResults);
  const [testActivo, setTestActivo] = useState<typeof testModules[0] | null>(null);
  const [pasoTest, setPasoTest] = useState(0);
  const [respuestasTest, setRespuestasTest] = useState<number[]>([]);
  const [resultadoActual, setResultadoActual] = useState<TestResultDetail | null>(null);
  const [cancelConfirm, setCancelConfirm] = useState(false);

  const testsCompletados = resultados.map(r => r.test);
  const todosCompletados = testModules.every(t => testsCompletados.includes(t.titulo));

  const iniciarTest = (test: typeof testModules[0]) => {
    setTestActivo(test);
    setPasoTest(0);
    setRespuestasTest([]);
    setResultadoActual(null);
    setCancelConfirm(false);
  };

  const enviarRespuestaTest = (opcionIndex: number) => {
    const nuevasRespuestas = [...respuestasTest, opcionIndex];
    setRespuestasTest(nuevasRespuestas);

    if (pasoTest < testActivo!.preguntas.length - 1) {
      setPasoTest(pasoTest + 1);
    } else {
      let score = 0;
      nuevasRespuestas.forEach(r => { if (r === 0) score += 2; if (r === 1) score += 1; });
      const maxScore = testActivo!.preguntas.length * 2;
      const scoreStr = `${score}/${maxScore}`;

      const detalle: TestResultDetail = {
        test: testActivo!.titulo,
        score: scoreStr,
        respuestas: nuevasRespuestas,
        interpretacion: interpretarPuntaje(scoreStr),
        fecha: new Date().toISOString(),
      };

      setResultadoActual(detalle);
    }
  };

  const guardarResultado = () => {
    if (!resultadoActual) return;
    const existente = resultados.findIndex(r => r.test === resultadoActual.test);
    let nuevos: TestResultDetail[];
    if (existente >= 0) {
      nuevos = [...resultados];
      nuevos[existente] = resultadoActual;
    } else {
      nuevos = [...resultados, resultadoActual];
    }
    setResultados(nuevos);
    setTestActivo(null);
    setResultadoActual(null);
    setRespuestasTest([]);
    setPasoTest(0);
  };

  const volverAlFormulario = () => {
    if (resultados.length > 0) {
      onComplete(resultados);
    } else {
      onBack();
    }
  };

  const colorInterpretacion = (texto: string): string => {
    if (texto === 'Excelente') return 'text-emerald-400';
    if (texto === 'Bueno') return 'text-[#E6CA65]';
    if (texto === 'Regular') return 'text-orange-400';
    return 'text-red-400';
  };

  if (testActivo && resultadoActual) {
    return (
      <div className="w-full space-y-6">
        <div className="bg-[#1A1A1A] p-6 sm:p-8 rounded-xl border border-[#E6CA65]/20 text-center flex flex-col items-center gap-4 shadow-2xl">
          <div className="w-20 h-20 rounded-full bg-[#E6CA65]/10 flex items-center justify-center border border-[#E6CA65]/20">
            <CheckCircle className="w-10 h-10 text-[#E6CA65]" />
          </div>
          <h3 className="text-xl font-bold text-white">Test Completado</h3>
          <p className="text-gray-300">Tu puntaje para <strong className="text-[#E6CA65]">{testActivo.titulo}</strong> es:</p>
          <p className="text-4xl font-extrabold text-[#E6CA65] glow-gold">{resultadoActual.score}</p>
          <p className={`text-sm font-semibold ${colorInterpretacion(resultadoActual.interpretacion)}`}>{resultadoActual.interpretacion}</p>
          <p className="text-xs text-gray-500">Gracias por completar la evaluación.</p>
          <button onClick={guardarResultado}
            className="mt-4 bg-[#E6CA65] text-black font-bold py-2.5 px-8 rounded-lg hover:bg-[#d8bd58] transition text-sm">
            {resultados.length + (resultados.findIndex(r => r.test === resultadoActual.test) >= 0 ? 0 : 1) < testModules.length
              ? 'Siguiente Test'
              : 'Ver resultados'}
          </button>
        </div>
      </div>
    );
  }

  if (testActivo) {
    const totalPreguntas = testActivo.preguntas.length;
    const respondidas = respuestasTest.length;
    const progreso = (respondidas / totalPreguntas) * 100;

    return (
      <div className="w-full space-y-6">
        <div className="bg-[#1A1A1A] p-6 sm:p-8 rounded-xl border border-[#2A2A2A] shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <button onClick={() => { setTestActivo(null); setCancelConfirm(false); }} className="text-gray-400 hover:text-gray-200 flex items-center gap-1 text-xs">
              <ChevronLeft className="w-4 h-4" /> Volver
            </button>
            <span className="text-xs text-gray-500 font-medium">{respondidas} / {totalPreguntas}</span>
          </div>
          <h3 className="text-xl font-bold text-[#E6CA65] mb-4">{testActivo.titulo}</h3>
          <div className="progress-bar mb-6">
            <div className="progress-bar-fill" style={{ width: `${progreso}%` }}></div>
          </div>
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
              <button onClick={() => { setTestActivo(null); setCancelConfirm(false); }} className="text-xs text-red-400 border border-red-800/50 px-3 py-1.5 rounded-lg hover:bg-red-900/20">Sí, cancelar</button>
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
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#E6CA65]">Seleccioná un test</h3>
        <button onClick={volverAlFormulario} className="text-xs text-gray-400 hover:text-gray-200 flex items-center gap-1">
          <ChevronLeft className="w-3 h-3" /> Volver al formulario
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {testModules.map(t => {
          const completado = resultados.find(r => r.test === t.titulo);
          return (
            <div key={t.id} className={`bg-[#1A1A1A] p-5 rounded-xl border ${completado ? 'border-emerald-700/50' : 'border-[#2A2A2A]'} flex flex-col justify-between shadow-lg transition`}>
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-bold text-white text-lg">{t.titulo}</h4>
                  {completado && <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />}
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">{t.desc}</p>
                <p className="text-xs text-gray-600 mt-2">{t.preguntas.length} preguntas</p>
                {completado && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs text-emerald-400 font-semibold">Puntaje: {completado.score}</span>
                    <span className={`text-xs font-semibold ${colorInterpretacion(completado.interpretacion || '')}`}>
                      {completado.interpretacion}
                    </span>
                  </div>
                )}
              </div>
              <button onClick={() => iniciarTest(t)}
                className={`mt-4 font-bold py-2.5 px-6 rounded-lg text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
                  completado
                    ? 'bg-emerald-700/30 text-emerald-300 border border-emerald-700/50 hover:bg-emerald-700/40'
                    : 'bg-[#E6CA65] text-black hover:bg-[#d8bd58] shadow-sm hover:shadow-md hover:shadow-[#E6CA65]/10'
                }`}>
                <FlaskConical className="w-4 h-4" /> {completado ? 'Repetir' : 'Iniciar Test'}
              </button>
            </div>
          );
        })}
      </div>

      {todosCompletados && (
        <button onClick={() => onComplete(resultados)}
          className="w-full bg-emerald-600 text-white font-bold py-4 rounded-lg hover:bg-emerald-500 transition-all duration-200 text-lg flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30">
          <CheckCircle className="w-5 h-5" /> Continuar con la Postulación
        </button>
      )}
    </div>
  );
}