import React, { useState } from "react";
import { Search, Flame, Eye, Sparkles, Box, ArrowRight, Video, Play, Copy, Check, Scan, MessageSquare, History } from "lucide-react";
import { PhysicsCategory, TabType } from "../types";
import { PHYSICS_CATEGORIES, FORMULA_OF_THE_DAY } from "../data";

interface HomeViewProps {
  onSelectCategory: (categoryName: string) => void;
  onStartNewtonPractice: () => void;
  onNavigate: (tab: TabType) => void;
}

export default function HomeView({ onSelectCategory, onStartNewtonPractice, onNavigate }: HomeViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedFormula, setCopiedFormula] = useState(false);
  const [showVideoCapsules, setShowVideoCapsules] = useState(false);

  const handleCopyFormula = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(FORMULA_OF_THE_DAY.equation);
    setCopiedFormula(true);
    setTimeout(() => setCopiedFormula(false), 2000);
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case "Flame":
        return <Flame className="w-6 h-6 text-orange-400 group-hover:scale-110 transition-transform" />;
      case "Eye":
        return <Eye className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform" />;
      case "Sparkles":
        return <Sparkles className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform" />;
      default:
        return <Box className="w-6 h-6 text-blue-400 group-hover:scale-110 transition-transform" />;
    }
  };

  // Sample video capsules for the Video-Cápsulas toggle
  const videoCapsules = [
    {
      id: "v-1",
      title: "Dilatación Térmica en Puentes",
      duration: "4:20 min",
      subject: "Termodinámica",
      views: "1.2k vistas",
    },
    {
      id: "v-2",
      title: "Comprendiendo la Ley de Gauss",
      duration: "6:45 min",
      subject: "Electromagnetismo",
      views: "2.4k vistas",
    },
    {
      id: "v-3",
      title: "Refracción de la Luz y Prismas",
      duration: "5:12 min",
      subject: "Óptica",
      views: "980 vistas",
    },
  ];

  return (
    <div className="space-y-6 pb-24 view-enter">
      {/* Welcome Message */}
      <div>
        <h2 className="text-3xl font-extrabold font-display tracking-tight text-white mt-1">
          ¡Hola, Estudiante!
        </h2>
        <p className="text-slate-400 text-sm mt-1.5 font-medium">
          ¿Qué problema resolveremos hoy con Physix AI?
        </p>
      </div>

      {/* Global Interactive Search Bar */}
      <div className="relative group">
        <div className="absolute inset-0 bg-blue-500/10 rounded-2xl blur group-focus-within:bg-blue-500/15 transition duration-300" />
        <div className="relative flex items-center bg-[#10192a] border border-white/5 rounded-2xl px-4 py-3.5 focus-within:border-blue-500/30 transition-all">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            type="text"
            placeholder="Describe un problema o fórmula..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-slate-100 placeholder-slate-500 text-[15px] focus:outline-none w-full font-medium"
            onKeyDown={(e) => {
              if (e.key === "Enter" && searchQuery.trim() !== "") {
                onSelectCategory(searchQuery);
                setSearchQuery("");
              }
            }}
          />
        </div>
      </div>

      {/* Acciones Rápidas (Quick Navigation) */}
      <div>
        <h3 className="text-sm font-extrabold font-mono tracking-widest text-slate-400 uppercase mb-3">
          Acciones Rápidas
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => onNavigate("scanner")}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-[#0c1424] border border-white/5 hover:border-blue-500/30 hover:bg-blue-950/20 transition-all text-center group active:scale-[0.97]"
          >
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-110 group-hover:bg-blue-500/20 transition-all mb-2 shadow-inner">
              <Scan className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-200 group-hover:text-white block truncate w-full">Escáner AI</span>
            <span className="text-[8.5px] text-slate-500 mt-0.5 block truncate w-full">Foto o Enunciado</span>
          </button>

          <button
            onClick={() => onNavigate("chat")}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-[#0c1424] border border-white/5 hover:border-emerald-500/30 hover:bg-emerald-950/20 transition-all text-center group active:scale-[0.97]"
          >
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all mb-2 shadow-inner">
              <MessageSquare className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-200 group-hover:text-white block truncate w-full">Tutor de IA</span>
            <span className="text-[8.5px] text-slate-500 mt-0.5 block truncate w-full">Resolución Paso a Paso</span>
          </button>

          <button
            onClick={() => onNavigate("history")}
            className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-[#0c1424] border border-white/5 hover:border-purple-500/30 hover:bg-purple-950/20 transition-all text-center group active:scale-[0.97]"
          >
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 group-hover:bg-purple-500/20 transition-all mb-2 shadow-inner">
              <History className="w-5 h-5" />
            </div>
            <span className="text-[11px] font-bold text-slate-200 group-hover:text-white block truncate w-full">Mi Historial</span>
            <span className="text-[8.5px] text-slate-500 mt-0.5 block truncate w-full">Logros y Ejercicios</span>
          </button>
        </div>
      </div>

      {/* Categories Grid */}
      <div>
        <h3 className="text-lg font-bold font-display tracking-wide text-white mb-3">
          Categorías
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
          {PHYSICS_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.name)}
              className={`group flex flex-col items-center justify-center p-5 rounded-2xl bg-gradient-to-b ${cat.color} border hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:shadow-blue-950/10 active:scale-[0.98] min-h-[100px]`}
            >
              <div className="p-2.5 rounded-xl bg-slate-900/40 border border-white/5 mb-3 group-hover:-translate-y-1 transition-transform">
                {getCategoryIcon(cat.iconName)}
              </div>
              <span className="text-[13px] font-bold tracking-wide font-display text-slate-100 group-hover:text-white">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Two-column layout on PC/Tablet */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
        {/* Recommended for you or Video Capsules Switch */}
        <div className="bg-[#0c1424] border border-white/5 rounded-2xl p-4 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold font-display tracking-wide text-white">
              {showVideoCapsules ? "Video-Cápsulas" : "Recomendado para ti"}
            </h3>
            <button
              onClick={() => setShowVideoCapsules(!showVideoCapsules)}
              className="text-[12px] font-semibold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center space-x-1"
            >
              <span>{showVideoCapsules ? "Ver recomendado" : "Ver todo"}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {!showVideoCapsules ? (
            /* Newton Practice Card */
            <div className="space-y-4">
              <div className="relative h-44 rounded-xl overflow-hidden border border-white/5 bg-[#0a1120]">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80 z-10" />

                {/* Futuristic light circles exactly like Screenshot 1 */}
                <div className="absolute inset-0 opacity-40 flex items-center justify-center pointer-events-none scale-105">
                  <div className="absolute w-40 h-40 rounded-full border-2 border-dashed border-blue-500 animate-[spin_30s_linear_infinite]" />
                  <div className="absolute w-48 h-48 rounded-full border border-double border-cyan-400 animate-[spin_40s_linear_infinite]" />
                  <div className="absolute w-32 h-32 rounded-full border border-dotted border-purple-500" />
                  <div className="w-24 h-24 rounded-full bg-blue-500/20 blur-xl animate-pulse" />
                </div>

                {/* Extra visual particles style */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.15),transparent_60%)]" />

                {/* Dynamic abstract light beam */}
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_8px_cyan]" />

                <div className="absolute top-3 left-3 flex items-center space-x-1.5 z-20">
                  <span className="text-[10px] font-semibold tracking-wide bg-blue-500/20 text-blue-300 px-2.5 py-1 rounded-full border border-blue-500/10">
                    #Mecánica
                  </span>
                  <span className="text-[10px] font-semibold tracking-wide bg-cyan-500/20 text-cyan-300 px-2.5 py-1 rounded-full border border-cyan-500/10">
                    15 min
                  </span>
                </div>
              </div>

              <div className="space-y-2.5">
                <h4 className="text-lg font-bold font-display tracking-tight text-white">
                  Práctica: Leyes de Newton
                </h4>
                <p className="text-slate-400 text-xs leading-relaxed font-medium">
                  Domina la dinámica resolviendo 5 problemas interactivos sobre fuerzas y aceleración.
                </p>
                <button
                  onClick={onStartNewtonPractice}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold font-display text-[13px] shadow-[0_4px_15px_rgba(37,99,235,0.3)] transition-all hover:scale-[1.01] active:scale-[0.98] mt-2 text-center"
                >
                  Empezar ahora
                </button>
              </div>
            </div>
          ) : (
            /* Video Capsules List */
            <div className="space-y-3">
              {videoCapsules.map((video) => (
                <div
                  key={video.id}
                  className="flex items-center space-x-3 p-3 rounded-xl bg-[#111a2e] border border-white/5 hover:border-white/10 transition-colors cursor-pointer group"
                  onClick={() => onSelectCategory(video.subject)}
                >
                  <div className="w-12 h-12 rounded-lg bg-slate-900 border border-white/5 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-950/20 group-hover:border-emerald-500/30 transition-all">
                    <Play className="w-5 h-5 fill-current" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold text-cyan-400 tracking-wider">
                      {video.subject.toUpperCase()}
                    </div>
                    <h4 className="text-xs font-bold text-slate-100 truncate mt-0.5 group-hover:text-white transition-colors">
                      {video.title}
                    </h4>
                    <div className="text-[10px] text-slate-500 mt-0.5 font-medium">
                      {video.duration} · {video.views}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Summary / Formula of the Day */}
        <div className="relative group h-full">
          {/* Glow border matching design */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 via-blue-500 to-indigo-500 rounded-2xl blur-xs opacity-50 group-hover:opacity-100 transition duration-300" />
          <div className="relative bg-[#0c1424] rounded-2xl p-5 border border-white/10 shadow-2xl h-full flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold tracking-widest text-[#10b981] font-mono">
                  FÓRMULA DEL DÍA
                </span>
                <button
                  onClick={handleCopyFormula}
                  className="p-1 px-2.5 rounded-lg bg-slate-900/60 border border-white/5 hover:bg-slate-800 hover:text-white text-slate-400 transition-all flex items-center space-x-1.5 text-[11px] active:scale-95"
                  aria-label="Clonar fórmula al portapapeles"
                >
                  {copiedFormula ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#10b981]" />
                      <span className="text-[#10b981] font-semibold">¡Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>

              <div
                onClick={() => onSelectCategory("Leyes de Newton")}
                className="bg-[#0a1120]/80 border border-white/5 rounded-xl p-6 flex flex-col items-center justify-center mb-4 cursor-pointer hover:border-white/10 transition-colors"
              >
                <span className="text-3xl font-extrabold font-mono tracking-widest text-[#e2e8f0]">
                  {FORMULA_OF_THE_DAY.equation}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <h4 className="text-xs font-bold text-slate-200">
                {FORMULA_OF_THE_DAY.name}
              </h4>
              <p className="text-[11px] font-medium text-slate-400 leading-relaxed">
                La fuerza neta sobre un objeto es igual al producto de su masa por su aceleración.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
