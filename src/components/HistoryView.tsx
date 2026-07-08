import React, { useState } from "react";
import { Search, Trophy, CheckCircle, Zap, Waves, Play, ChevronRight, Award, Trash2 } from "lucide-react";
import { SolverExercise, TopicMastery, TabType } from "../types";

interface HistoryViewProps {
  masteries: TopicMastery[];
  exercises: SolverExercise[];
  onOpenExercise: (title: string) => void;
  onStartEinsteinChallenge: () => void;
  onClearHistory?: () => void;
  onNavigate?: (tab: TabType) => void;
}

export default function HistoryView({
  masteries,
  exercises,
  onOpenExercise,
  onStartEinsteinChallenge,
  onClearHistory,
  onNavigate,
}: HistoryViewProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredExercises = exercises.filter((ex) =>
    ex.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ex.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getExerciseIcon = (status: SolverExercise["status"]) => {
    switch (status) {
      case "perfect":
        return (
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
        );
      case "trying":
        return (
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 animate-pulse" />
          </div>
        );
      case "reviewed":
        return (
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
            <Waves className="w-5 h-5" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/5 text-slate-400 flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 pb-28 view-enter">
      {/* 1. Header with search matching Screenshot 4 */}
      <div className="relative group mt-1.5">
        <div className="absolute inset-0 bg-blue-500/10 rounded-2xl blur group-focus-within:bg-blue-500/15 transition duration-300" />
        <div className="relative flex items-center bg-[#10192a] border border-white/5 rounded-2xl px-4 py-3 focus-within:border-blue-500/30 transition-all">
          <Search className="w-4.5 h-4.5 text-slate-400 mr-2.5" />
          <input
            type="text"
            placeholder="Buscar en el historial..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-slate-100 placeholder-slate-500 text-sm focus:outline-none w-full font-medium"
          />
        </div>
      </div>

      {/* Responsive layout grouping for wider screens (PC and Tablet) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* 2. Topic Mastery (Dominio de temas) */}
        <div className="bg-[#0c1424] border border-white/5 rounded-2xl p-5 shadow-xl h-full">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold font-display text-white tracking-wide">
              Dominio de Temas
            </h3>
            <span className="text-xs font-bold text-emerald-400 font-mono">
              Promedio: 84%
            </span>
          </div>

          <div className="space-y-4">
            {masteries.map((m, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 font-display">
                    {m.topic}
                  </span>
                  <span className="text-xs font-bold text-slate-300 font-mono">
                    {m.percentage}%
                  </span>
                </div>

                {/* Progress Slider Track */}
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden border border-white/5 p-[1px]">
                  <div
                    className={`h-full ${m.color} rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.3)]`}
                    style={{ width: `${m.percentage}%` }}
                  />
                </div>

                {/* Skill Badge */}
                <div className="flex justify-start">
                  <span className="text-[9px] font-extrabold tracking-widest bg-blue-950/40 text-blue-300 px-2.5 py-1 rounded-md border border-blue-500/10 font-mono uppercase">
                    {m.level}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Solved Exercises (Ejercicios Solucionados) */}
        <div>
          <div className="flex items-center justify-between mb-3.5">
            <h3 className="text-base font-bold font-display text-white tracking-wide">
              Ejercicios Solucionados
            </h3>
            <div className="flex items-center space-x-3">
              {onClearHistory && exercises.length > 0 && (
                <button
                  onClick={onClearHistory}
                  className="text-[10px] text-slate-500 hover:text-rose-400 font-bold transition-colors flex items-center space-x-1"
                  title="Limpiar registro"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Limpiar</span>
                </button>
              )}
              <span className="text-xs font-semibold text-slate-500">
                Ver todo
              </span>
            </div>
          </div>

          {filteredExercises.length === 0 ? (
            <div className="text-center py-10 px-4 rounded-2xl bg-[#0c1424]/40 border border-dashed border-white/5 space-y-4">
              <div className="relative w-12 h-12 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-sm" />
                <Trophy className="relative w-8 h-8 text-slate-500 animate-bounce" />
              </div>
              <div className="space-y-1">
                <p className="text-slate-300 text-sm font-semibold">
                  No hay ejercicios en tu historial
                </p>
                <p className="text-slate-500 text-xs max-w-xs mx-auto">
                  Escanéa una fórmula con la cámara o conversa con el tutor para iniciar tu registro.
                </p>
              </div>
              {onNavigate && (
                <div className="flex items-center justify-center space-x-2.5 pt-2">
                  <button
                    onClick={() => onNavigate("scanner")}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold font-display text-[11px] tracking-wide shadow-md transition-all active:scale-95 flex items-center space-x-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-scan"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M3 17v2a2 2 0 0 0 2 2h2"/></svg>
                    <span>Escanear Problema</span>
                  </button>
                  <button
                    onClick={() => onNavigate("chat")}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold font-display text-[11px] tracking-wide transition-all active:scale-95 flex items-center space-x-1 border border-white/5"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-square"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                    <span>Preguntar al Tutor</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredExercises.map((ex) => (
                <div
                  key={ex.id}
                  onClick={() => onOpenExercise(ex.title)}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-[#0c1424] border border-white/5 hover:border-white/10 hover:bg-[#111a2d]/50 transition-all cursor-pointer group active:scale-[0.99]"
                >
                  <div className="flex items-center space-x-3.5">
                    {getExerciseIcon(ex.status)}
                    <div>
                      <h4 className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors">
                        {ex.title}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                        {ex.timestamp} · {ex.statusText}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-slate-500">
                    <button
                      className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-all scale-90 group-hover:scale-100"
                      aria-label="Reproducir solución"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. Month Challenge Card (Desafío del mes) */}
      <div className="relative group overflow-hidden rounded-2xl">
        {/* Glow halo */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-indigo-600 to-cyan-400 rounded-2xl blur-xs opacity-40 group-hover:opacity-100 transition duration-300" />
        <div className="relative h-48 p-5 rounded-2xl bg-[#0c1424] border border-white/10 flex flex-col justify-between overflow-hidden">
          {/* Futuristic background elements matching Screenshot 4 */}
          <div className="absolute inset-0 opacity-15 flex items-center justify-center pointer-events-none scale-110">
            {/* Relatividad formulas / math background */}
            <div className="absolute font-mono text-[9px] text-indigo-400 font-extrabold rotate-12 left-4 top-10">
              E = m · c²
            </div>
            <div className="absolute font-mono text-[8px] text-indigo-400 font-extrabold -rotate-12 right-6 bottom-12">
              t' = t / √(1 - v²/c²)
            </div>
            <div className="absolute w-52 h-52 border border-dashed border-indigo-500 rounded-full animate-[spin_50s_linear_infinite]" />
          </div>

          <div className="space-y-1.5 z-10">
            <div className="flex items-center space-x-1.5">
              <Award className="w-4 h-4 text-blue-400" />
              <span className="text-[10px] font-black tracking-wider text-blue-400 uppercase font-mono">
                DESAFÍO DEL MES
              </span>
            </div>
            <h4 className="text-lg font-black font-display text-white tracking-tight leading-tight pt-1">
              Relatividad Especial
            </h4>
            <p className="text-slate-400 text-xs leading-relaxed max-w-xs font-semibold">
              Completa 5 módulos para ganar la insignia de Einstein y dominar la dilatación temporal.
            </p>
          </div>

          <button
            onClick={onStartEinsteinChallenge}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-300 hover:to-indigo-400 text-white font-bold font-display text-[12px] shadow-lg transition-all active:scale-95 text-center self-start shrink-0 z-10"
          >
            Empezar ahora
          </button>
        </div>
      </div>
    </div>
  );
}
