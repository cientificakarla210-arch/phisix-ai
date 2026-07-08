import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Sparkles, Plus, Camera, Mic, RefreshCw, AlertTriangle, ChevronRight, HelpCircle, Tv } from "lucide-react";
import { Message, SolverExercise } from "../types";
import FormulaBlock from "./FormulaBlock";

interface ChatViewProps {
  categoryFilter?: string;
  onClearFilter?: () => void;
  onNavigateToScanner?: () => void;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  onResetChat?: () => void;
  onOpenVideo?: (explanation: string, title?: string) => void;
  exercises?: SolverExercise[];
  onAddHistoryItem?: (title: string, category: string, status: "perfect" | "trying" | "reviewed", statusText: string) => void;
}

export default function ChatView({
  categoryFilter,
  onClearFilter,
  onNavigateToScanner,
  messages,
  setMessages,
  onResetChat,
  onOpenVideo,
  exercises = [],
  onAddHistoryItem,
}: ChatViewProps) {
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "es-ES"; // Configured for Spanish as requested

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onerror = (event: any) => {
        console.error("Error en reconocimiento de voz:", event.error);
        setIsListening(false);
        if (event.error === "not-allowed") {
          setErrorMsg("Permiso de micrófono denegado. Por favor, actívalo en la barra del navegador para dictar.");
        } else if (event.error === "no-speech") {
          // Silent error if no speech is detected
        } else {
          setErrorMsg(`Error de voz: ${event.error}. Intenta de nuevo.`);
        }
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputValue((prev) => (prev ? prev + " " + transcript : transcript));
        }
      };

      recognitionRef.current = rec;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const handleMicClick = () => {
    if (!recognitionRef.current) {
      setErrorMsg("El dictado de voz no es soportado por este navegador.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setErrorMsg(null);
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error("Error starting voice dictation:", err);
      }
    }
  };

  // Default suggestion chips based on selected category or general physics
  const getStaticChips = () => {
    if (!categoryFilter) return ["¿Cómo se calcula la energía cinética?", "Ejemplos de gravedad", "Fórmula de velocidad"];
    if (categoryFilter.toLowerCase().includes("mecanica")) {
      return ["¿Qué es la masa?", "Fórmulas de Caída Libre", "Leyes de Newton en la vida real"];
    }
    if (categoryFilter.toLowerCase().includes("termo")) {
      return ["¿Qué es la entropía?", "Fórmula de gases ideales", "Primera ley de la termo"];
    }
    if (categoryFilter.toLowerCase().includes("opti")) {
      return ["Ley de Snell explicada", "Espejos cóncavos y convexos", "¿Cómo funciona un prisma?"];
    }
    if (categoryFilter.toLowerCase().includes("electro")) {
      return ["Ley de Ohm y circuitos", "¿Qué es un campo magnético?", "Circuitos RC paso a paso"];
    }
    return ["Ejemplo práctico", "Ecuación matemática", "Concepto fundamental"];
  };

  const chips = getStaticChips();

  // Scroll to bottom on updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // When a category filter is selected, inject initial helpful system context if there is no previous messages or prompt
  useEffect(() => {
    if (categoryFilter && messages.length <= 1) {
      setMessages([
        {
          id: "welcome-cat",
          role: "assistant",
          content: `¡Hola! Me alegro de que estés explorando el tema de **${categoryFilter}**. 

¿Qué problema práctico, fórmula o duda tienes el día de hoy? Pregúntame libremente o selecciona una de las sugerencias de abajo para empezar.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    }
  }, [categoryFilter]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    setErrorMsg(null);
    const userTimestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: Message = {
      id: `m-user-${Date.now()}`,
      role: "user",
      content: text,
      timestamp: userTimestamp,
    };

    // Log this query into user history dynamically with keyword-based category detection
    if (onAddHistoryItem && text.trim().length > 3) {
      const displayTitle = text.length > 40 ? text.substring(0, 37) + "..." : text;
      let cat = "General";
      const low = text.toLowerCase();
      if (low.includes("newton") || low.includes("fuerza") || low.includes("dinamica") || low.includes("aceleracion")) {
        cat = "Mecánica Clásica";
      } else if (low.includes("caida") || low.includes("gravedad") || low.includes("movimiento") || low.includes("velocidad")) {
        cat = "Mecánica Clásica";
      } else if (low.includes("termo") || low.includes("calor") || low.includes("gas") || low.includes("entropia")) {
        cat = "Termodinámica";
      } else if (low.includes("circuito") || low.includes("ohm") || low.includes("rc") || low.includes("corriente") || low.includes("campo")) {
        cat = "Electromagnetismo";
      } else if (low.includes("opti") || low.includes("espejo") || low.includes("lente") || low.includes("prisma") || low.includes("luz")) {
        cat = "Óptica";
      } else if (categoryFilter) {
        cat = categoryFilter;
      }
      onAddHistoryItem(displayTitle, cat, "reviewed", "Búsqueda en Chat");
    }

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputValue("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
          category: categoryFilter,
          history: exercises,
        }),
      });

      if (!response.ok) {
        let errorMessage = "Fallo en la comunicación con Physix AI.";
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch (e) {}
        } else {
          try {
            const textText = await response.text();
            if (textText && textText.length < 200 && !textText.includes("<!DOCTYPE") && !textText.includes("<!doctype")) {
              errorMessage = textText;
            } else {
              errorMessage = "El servidor devolvió una respuesta de error en formato HTML o texto.";
            }
          } catch (e) {}
        }
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("El servidor devolvió una página HTML en lugar de datos JSON (posible error de ruta o inicio). Por favor reinicia el servidor.");
      }

      const data = await response.json();
      const aiTimestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

      setMessages((prev) => [
        ...prev,
        {
          id: `m-ai-${Date.now()}`,
          role: "assistant",
          content: data.text,
          timestamp: aiTimestamp,
        },
      ]);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Error al conectar con el servidor. Verifica tu conexión a internet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] pb-24 view-enter">
      {/* Top Chat Control Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-3 shrink-0">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest font-mono">Tutor Online</span>
        </div>
        
        <button
          onClick={() => {
            if (onResetChat) {
              onResetChat();
            } else {
              setMessages([
                {
                  id: "m-welcome-init-reset-" + Date.now(),
                  role: "assistant",
                  content: `¡Hola, Estudiante! 👋 Eres bienvenido a **Physix AI**, tu tutor interactivo de física acelerado por Inteligencia Artificial.

Puedo ayudarte con cualquier ejercicio de **FÍSICA I** (como **Mecánica**, **Termodinámica**, **Óptica** o **Electromagnetismo**). 

¿Qué problema, constante física o fórmula te gustaría que analicemos paso a paso hoy? Escríbela en la caja o escanea una foto con tu cámara.`,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ]);
              if (onClearFilter) {
                onClearFilter();
              }
            }
          }}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/15 text-xs font-bold transition-all duration-200 active:scale-95"
          title="Reiniciar conversación desde cero"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reiniciar Chat</span>
        </button>
      </div>

      {/* Category filter active badge */}
      {categoryFilter && (
        <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 mb-3 text-xs">
          <div className="flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-slate-300 font-medium">
              Foco activo: <strong className="text-blue-400">{categoryFilter}</strong>
            </span>
          </div>
          <button
            onClick={onClearFilter}
            className="text-slate-500 hover:text-white font-bold transition-colors"
          >
            Atrás
          </button>
        </div>
      )}

      {/* Messages Box */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-6 pb-4 scroll-smooth">
        {/* Helper Date badge */}
        <div className="flex justify-center my-2">
          <span className="bg-slate-800/80 text-[10px] font-bold tracking-widest text-slate-400 px-3 py-1 rounded-full border border-white/5 uppercase">
            HOY
          </span>
        </div>

        {messages.map((msg) => {
          const isUser = msg.role === "user";

          return (
            <div key={msg.id} className={`flex items-start ${isUser ? "justify-end" : "justify-start"} group`}>
              {/* Sparkles avatar for AI */}
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-blue-600/15 border border-blue-500/20 flex items-center justify-center mr-3 text-blue-400 shrink-0 self-start mt-1">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}

              <div className="flex flex-col max-w-[85%]">
                {/* Content card */}
                {isUser ? (
                  <div className="bg-blue-600 border border-blue-500/20 text-white rounded-2xl rounded-tr-none px-4 py-3 shadow-lg select-text text-[15px] font-medium leading-relaxed">
                    {msg.content}
                  </div>
                ) : (
                  <div className="bg-[#0e203c]/40 border border-[#1d3557]/30 text-slate-200 rounded-2xl rounded-tl-none px-4.5 py-4.5 shadow-xl select-text">
                    <FormulaBlock text={msg.content} />
                    
                    {onOpenVideo && (
                      <div className="flex justify-start mt-3 pt-3 border-t border-white/5">
                        <button
                          onClick={() => onOpenVideo(msg.content, "Explicación Interactiva")}
                          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-white border border-red-500/20 text-[10px] font-black tracking-wider uppercase transition-all duration-200 active:scale-95"
                          title="Generar y reproducir video explicativo animado de este problema"
                        >
                          <Tv className="w-3.5 h-3.5" />
                          <span>Generar Explicación en Video</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Info and timestamp line */}
                <div
                  className={`flex items-center space-x-1.5 mt-1.5 text-[10px] text-slate-500 ${
                    isUser ? "justify-end" : "justify-start ml-1"
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {!isUser && (
                    <>
                      <span>·</span>
                      <span className="font-semibold text-blue-400/80">Physix AI 2.0</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Bubble */}
        {loading && (
          <div className="flex items-start justify-start">
            <div className="w-8 h-8 rounded-xl bg-blue-600/15 border border-blue-500/20 flex items-center justify-center mr-3 text-blue-400 shrink-0 animate-spin">
              <RefreshCw className="w-4 h-4" />
            </div>
            <div className="bg-[#0e203c]/20 border border-[#1d3557]/20 text-slate-400 px-5 py-4 rounded-2xl rounded-tl-none flex items-center space-x-2 shadow-inner">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              <span className="text-xs font-semibold tracking-wide ml-2 text-slate-400 font-mono">
                Pensando y resolviendo...
              </span>
            </div>
          </div>
        )}

        {/* Error notification */}
        {errorMsg && (
          <div className="flex items-start space-x-3 p-4 rounded-xl bg-orange-950/20 border border-orange-500/30 text-orange-200 text-xs shadow-lg">
            <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold">Error del Servidor</div>
              <div>{errorMsg}</div>
              <button
                onClick={() => {
                  const lastUserMsg = messages[messages.length - 1];
                  if (lastUserMsg && lastUserMsg.role === "user") {
                    handleSendMessage(lastUserMsg.content);
                  }
                }}
                className="mt-2 px-3 py-1 rounded bg-orange-850 hover:bg-orange-800 text-orange-100 font-semibold uppercase tracking-wider text-[10px] transition-colors"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggestion Chips */}
      {!loading && (
        <div className="py-2 overflow-x-auto select-none no-scrollbar flex items-center space-x-2 -mx-4 px-4 shrink-0">
          {chips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(chip)}
              className="px-3.5 py-2 rounded-xl bg-[#09101d] border border-white/5 hover:border-blue-500/30 hover:bg-slate-900/40 text-slate-300 hover:text-white text-xs font-semibold whitespace-nowrap transition-all duration-200 active:scale-95 shadow-inner grow shrink-0"
            >
              {chip}
            </button>
          ))}
        </div>
      )}

      {/* Message Input line */}
      <div className="shrink-0 pt-2 pb-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputValue);
          }}
          className="flex items-center space-x-2"
        >
          {/* Controls Bar */}
          <div className="flex-1 flex items-center bg-[#10192a] border border-white/5 rounded-2xl px-3 py-2 focus-within:border-blue-500/30 transition-all shadow-inner relative">
            <button
              type="button"
              onClick={() => {
                // Instantly generate a helpful mock formula
                setInputValue(`¿Cómo calcular la aceleración centrípeta? Explícame paso a paso con su fórmula.`);
              }}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-300 transition-colors hover:bg-white/5 active:scale-90"
              title="Añadir recurso / Fórmula"
            >
              <Plus className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={onNavigateToScanner}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-300 transition-colors hover:bg-white/5 active:scale-90"
              title="Abrir cámara escáner"
            >
              <Camera className="w-5 h-5" />
            </button>

            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={loading}
              placeholder={isListening ? "Escuchando... ¡habla ahora!" : "Pregunta sobre partículas, energía o esp..."}
              className={`bg-transparent text-slate-100 placeholder-slate-500 text-[14px] focus:outline-none w-full px-2 font-medium transition-colors ${
                isListening ? "text-cyan-400 placeholder-cyan-500/70" : ""
              }`}
            />

            <button
              type="button"
              onClick={handleMicClick}
              className={`p-2 rounded-xl transition-all active:scale-90 relative ${
                isListening
                  ? "text-red-400 bg-red-500/10 hover:bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse"
                  : "text-slate-500 hover:text-slate-300 hover:bg-white/5"
              }`}
              title={isListening ? "Detener dictado de voz" : "Dictar por voz"}
            >
              <Mic className="w-5 h-5" />
              {isListening && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-ping" />
              )}
            </button>
          </div>

          <button
            type="submit"
            disabled={!inputValue.trim() || loading}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-md shrink-0 active:scale-95 ${
              inputValue.trim() && !loading
                ? "bg-blue-600 text-white hover:bg-blue-500 shadow-blue-500/20"
                : "bg-slate-800 text-slate-500 cursor-not-allowed"
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
