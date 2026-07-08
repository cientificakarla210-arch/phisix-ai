import React, { useState } from "react";
import Header from "./components/Header";
import BottomNavigation from "./components/BottomNavigation";
import HomeView from "./components/HomeView";
import ChatView from "./components/ChatView";
import ScannerView from "./components/ScannerView";
import HistoryView from "./components/HistoryView";
import VideoStudio from "./components/VideoStudio";
import { TabType, Message, SolverExercise, TopicMastery } from "./types";
import { INITIAL_EXERCISES, INITIAL_MASTERY } from "./data";
import { Sparkles, X, Trophy, Milestone, Award, Flame, Star, BookOpen } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>("home");
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>(undefined);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [exercises, setExercises] = useState<SolverExercise[]>(INITIAL_EXERCISES);
  const [videoExplanation, setVideoExplanation] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState<string | null>(null);

  // Dynamic Topic Mastery calculated based on user exercises and history
  const dynamicMasteries = React.useMemo<TopicMastery[]>(() => {
    const categoriesInfo = [
      {
        topic: "Mecánica Clásica",
        keys: ["mecánica", "mecanica", "newton", "caída", "caida", "movimiento", "velocidad", "gravedad", "fuerza", "dinámica", "dinamica", "aceleración", "aceleracion"],
        base: 45,
        color: "bg-blue-500",
      },
      {
        topic: "Electromagnetismo",
        keys: ["electromagnetismo", "circuito", "ohm", "corriente", "campo", "gauss", "rc", "eléctrico", "electrico"],
        base: 30,
        color: "bg-cyan-500",
      },
      {
        topic: "Termodinámica",
        keys: ["termodinámica", "termodinamica", "termodidámica", "termo", "calor", "gas", "entropia", "entropía", "temperatura", "dilatación", "dilatacion"],
        base: 25,
        color: "bg-orange-500",
      },
      {
        topic: "Óptica",
        keys: ["óptica", "optica", "espejo", "lente", "prisma", "luz", "refracción", "refraccion"],
        base: 20,
        color: "bg-purple-500",
      },
    ];

    return categoriesInfo.map((cat) => {
      const matchedExercises = exercises.filter((ex) => {
        const titleLow = ex.title.toLowerCase();
        const catLow = ex.category.toLowerCase();
        return cat.keys.some(key => titleLow.includes(key) || catLow.includes(key));
      });

      let scoreAddition = 0;
      matchedExercises.forEach((ex) => {
        if (ex.status === "perfect") {
          scoreAddition += 20;
        } else if (ex.status === "trying") {
          scoreAddition += 12;
        } else {
          scoreAddition += 10;
        }
      });

      const percentage = Math.min(100, cat.base + scoreAddition);

      let level: "EXPERTO" | "AVANZADO" | "PRINCIPIANTE" | "INTERMEDIO" = "PRINCIPIANTE";
      if (percentage >= 85) {
        level = "EXPERTO";
      } else if (percentage >= 65) {
        level = "AVANZADO";
      } else if (percentage >= 40) {
        level = "INTERMEDIO";
      }

      return {
        topic: cat.topic,
        percentage,
        level,
        color: cat.color,
      };
    });
  }, [exercises]);

  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      id: "m-welcome-init",
      role: "assistant",
      content: `¡Hola, Estudiante! 👋 Eres bienvenido a **Physix AI**, tu tutor interactivo de física acelerado por Inteligencia Artificial.

Puedo ayudarte con cualquier ejercicio de **FÍSICA I** (como **Mecánica**, **Termodinámica**, **Óptica** o **Electromagnetismo**). 

¿Qué problema, constante física o fórmula te gustaría que analicemos paso a paso hoy? Escríbela en la caja o escanea una foto con tu cámara.`,
      timestamp: "14:02",
    },
  ]);

  // Handle selected categories from landing grid
  const handleSelectCategory = (categoryName: string) => {
    setCategoryFilter(categoryName);
    setActiveTab("chat");
  };

  // Launch Newtonian practice test
  const handleStartNewtonPractice = () => {
    const newtonianMsg: Message = {
      id: `m-newton-${Date.now()}`,
      role: "user",
      content: "Quiero iniciar la práctica de las Leyes de Newton.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [
      ...prev,
      newtonianMsg,
      {
        id: `m-newton-ai-${Date.now()}`,
        role: "assistant",
        content: `### 🚀 Desafío Práctico: Leyes de Newton

¡Bienvenido a la sesión práctica! Vamos a dominar la dinámica con este primer desafío interactivo:

**Problema 1:** 
Un astronauta de masa m = 80 kg se coloca sobre una plataforma espacial y activa sus propulsores que ejercen una fuerza vertical constante de F = 400 N. 

Despreciando fuerzas de gravedad externas en esa sección libre, ¿con qué aceleración se desplazará el astronauta?

[FORMULA]
F = m · a  ⇒  a = F / m
---
F = fuerza neta (N)
m = masa del objeto (kg)
a = aceleración resultante (m/s²)
[/FORMULA]

*Pista didáctica:* Divide la fuerza total entre la masa. Escribe tu respuesta abajo o pídeme revisar tu cálculo para continuar.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);

    setCategoryFilter("Leyes de Newton");
    setActiveTab("chat");
  };

  // Launch Einstein relativity challenge
  const handleStartEinsteinChallenge = () => {
    const einsteinMsg: Message = {
      id: `m-einstein-${Date.now()}`,
      role: "user",
      content: "Quiero iniciar el desafío mensual de Relatividad Especial.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [
      ...prev,
      einsteinMsg,
      {
        id: `m-einstein-ai-${Date.now()}`,
        role: "assistant",
        content: `### 🌌 Desafío del Mes: Relatividad Especial

¡Excelente elección! Estás ingresando oficialmente en la física relativista de Albert Einstein. Aquí tienes tu primera pregunta para la insignia cuántica:

**Concepto 1: Dilatación Temporal**
Si viajas en una nave espacial ultrarrápida a un 80% de la velocidad de la luz (v = 0.8c), ¿cómo fluye el tiempo dentro de tu nave en comparación con un observador que se quedó esperando en la Tierra?

[FORMULA]
Δt = Δt₀ / √(1 - v² / c²)
---
Δt = tiempo medido por observador estático (s)
Δt_0 = tiempo propio medido en la nave (s)
v = velocidad de la nave (m/s)
c = velocidad de la luz (3 × 10⁸ m/s)
[/FORMULA]

A esta velocidad relativista extrema, el factor de Lorentz γ ≈ 1.67.
¡El tiempo en la Tierra transcurrirá casi un **67% más rápido** que para ti en la nave!

¿Te gustaría resolver un problema con velocidades reales o que desglosemos la fórmula de la energía relativista E = m · c²? Escríbelo abajo.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);

    setCategoryFilter("Relatividad Especial");
    setActiveTab("chat");
  };

  // Open an historical exercise inside chat
  const handleOpenExercise = (title: string) => {
    const queryMsg: Message = {
      id: `m-query-${Date.now()}`,
      role: "user",
      content: `Muéstrame la resolución del ejercicio de mi historial: "${title}"`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [
      ...prev,
      queryMsg,
      {
        id: `m-query-ai-${Date.now()}`,
        role: "assistant",
        content: `### 📁 Registro de Ejercicio Cargado de tu Almacén

Has vuelto a cargar el análisis para **${title}**. Aquí tienes el desarrollo simplificado:

[FORMULA]
a = (v_f - v_i) / t
---
a = aceleración media (m/s²)
v_f = velocidad final (m/s)
v_i = velocidad inicial (m/s)
t = intervalo de tiempo (s)
[/FORMULA]

Si necesitas re-escanear para recalcular variables o graficar el comportamiento cinemático, házmelo saber. Estás haciendo un gran trabajo.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }
    ]);

    setActiveTab("chat");
  };

  // Add exercise directly to scanner history logs
  const handleAddSolveHistory = (
    title: string,
    category: string,
    status: "perfect" | "trying" | "reviewed" = "perfect",
    statusText: string = "Resolución perfecta"
  ) => {
    const newEx: SolverExercise = {
      id: `ex-new-${Date.now()}`,
      title: title,
      category: category,
      timestamp: "Hace unos momentos",
      status: status,
      statusText: statusText,
      attempts: 1,
      createdAt: Date.now(),
    };
    setExercises((prev) => {
      // Avoid immediate duplicate titles in the last 10 seconds
      if (prev.some(ex => ex.title.toLowerCase() === title.toLowerCase() && Date.now() - (ex.createdAt || 0) < 10000)) {
        return prev;
      }
      return [newEx, ...prev];
    });
  };

  const handleSparklesClick = () => {
    const randomTopic = ["Cinemática", "Conservación de la Energía", "Leyes de Kepler", "Dinámica cuántica"];
    const topic = randomTopic[Math.floor(Math.random() * randomTopic.length)];
    handleSelectCategory(`Tutoría rápida sobre ${topic}`);
  };

  const handleClearHistory = () => {
    setExercises([]);
  };

  const handleResetChat = () => {
    setCategoryFilter(undefined);
    setChatMessages([
      {
        id: "m-welcome-init-reset-" + Date.now(),
        role: "assistant",
        content: `¡Hola, Estudiante! 👋 Eres bienvenido a **Physix AI**, tu tutor interactivo de física acelerado por Inteligencia Artificial.

Puedo ayudarte con cualquier tema de **Mecánica**, **Termodinámica**, **Óptica** o **Electromagnetismo**. 

¿Qué problema, constante física o fórmula te gustaría que analicemos paso a paso hoy? Escríbela en la caja o escanea una foto con tu cámara.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-[#040810] text-[#f8fafc] flex flex-col justify-between">
      {/* Centered Device Companion Wrapper to fit layout elegantly */}
      <div className="w-full max-w-xl md:max-w-3xl lg:max-w-5xl mx-auto min-h-screen bg-[#070d19] flex flex-col relative shadow-[0_0_60px_rgba(0,0,0,0.6)] border-x border-white/5 transition-all duration-300">
        
        {/* Header toolbar */}
        <Header
          onAvatarClick={() => setShowProfileModal(true)}
          title="Physix AI"
          hasShutterLogo={activeTab === "scanner"}
          onHomeClick={() => setActiveTab("home")}
        />

        {/* View Space containing conditional screen rendering */}
        <main className="flex-1 px-6 py-4 overflow-y-auto overflow-x-hidden">
          {activeTab === "home" && (
            <HomeView
              onSelectCategory={handleSelectCategory}
              onStartNewtonPractice={handleStartNewtonPractice}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === "chat" && (
            <ChatView
              categoryFilter={categoryFilter}
              onClearFilter={() => setCategoryFilter(undefined)}
              onNavigateToScanner={() => setActiveTab("scanner")}
              messages={chatMessages}
              setMessages={setChatMessages}
              onResetChat={handleResetChat}
              onOpenVideo={(exp, t) => {
                setVideoExplanation(exp);
                setVideoTitle(t || "Explicación de Física");
              }}
              exercises={exercises}
              onAddHistoryItem={handleAddSolveHistory}
            />
          )}

          {activeTab === "scanner" && (
            <ScannerView
              onAddSolveHistory={handleAddSolveHistory}
              onNavigateToChat={() => setActiveTab("chat")}
              setChatMessages={setChatMessages}
              onOpenVideo={(exp, t) => {
                setVideoExplanation(exp);
                setVideoTitle(t || "Explicación de Física");
              }}
            />
          )}

          {activeTab === "history" && (
            <HistoryView
              masteries={dynamicMasteries}
              exercises={exercises}
              onOpenExercise={handleOpenExercise}
              onStartEinsteinChallenge={handleStartEinsteinChallenge}
              onClearHistory={handleClearHistory}
              onNavigate={setActiveTab}
            />
          )}
        </main>

        {/* Bottom Navigation with context trigger buttons */}
        <BottomNavigation
          activeTab={activeTab}
          onChangeTab={(tab) => {
            setActiveTab(tab);
          }}
          showSparklesBtn={activeTab === "home" || activeTab === "history"}
          onSparklesClick={handleSparklesClick}
        />

        {/* PROFILE/STATS DIALOG INTERACTION MODAL */}
        {showProfileModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-5 animate-fadeIn">
            <div className="relative w-full max-w-md bg-[#0e1726] border border-white/10 rounded-3xl p-6 shadow-2xl overflow-hidden text-center space-y-5">
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="p-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Avatar section */}
              <div className="flex flex-col items-center">
                <div className="relative mb-3">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full blur animate-pulse" />
                  <img
                    src="https://images.unsplash.com/photo-1628157582853-a796fa650a6a?q=80&w=200&auto=format&fit=crop"
                    className="relative w-20 h-20 rounded-full border-2 border-white object-cover"
                    alt="Cyberpunk student profile"
                  />
                </div>
                <h3 className="text-xl font-bold font-display text-white">Estudiante Estelar</h3>
                <p className="text-xs text-blue-400 font-mono tracking-wider font-semibold">ESTUDIANTE DE FÍSICA</p>
              </div>

              {/* Divider */}
              <div className="h-[1px] bg-white/5" />

              {/* Stats bento layout */}
              <div className="grid grid-cols-2 gap-3 pb-2 text-left">
                <div className="p-3 bg-[#0a1120] border border-white/5 rounded-2xl flex items-center space-x-3">
                  <Flame className="w-5 h-5 text-orange-400" />
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Streak Diario</div>
                    <div className="text-sm font-bold text-white font-mono">5 Días</div>
                  </div>
                </div>

                <div className="p-3 bg-[#0a1120] border border-white/5 rounded-2xl flex items-center space-x-3">
                  <Trophy className="w-5 h-5 text-amber-400" />
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Ejercicios</div>
                    <div className="text-sm font-bold text-white font-mono">{exercises.length} Listos</div>
                  </div>
                </div>

                <div className="p-3 bg-[#0a1120] border border-white/5 rounded-2xl flex items-center space-x-3 col-span-2">
                  <Award className="w-5 h-5 text-purple-400" />
                  <div>
                    <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Próxima Insignia</div>
                    <div className="text-xs font-bold text-slate-300">Premio cuántico de Einstein (74% completado)</div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowProfileModal(false)}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold font-display text-xs tracking-wider transition-colors"
              >
                Volver al laboratorio
              </button>
            </div>
          </div>
        )}

        {/* INTERACTIVE VIDEO STUDIO OVERLAY */}
        {videoExplanation && (
          <VideoStudio
            title={videoTitle || "Explicación de Física"}
            explanation={videoExplanation}
            category={categoryFilter || "Física General"}
            onClose={() => {
              setVideoExplanation(null);
              setVideoTitle(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

