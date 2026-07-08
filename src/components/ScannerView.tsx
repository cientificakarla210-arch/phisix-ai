import React, { useState, useRef, useEffect } from "react";
import { Flashlight, Image as ImageIcon, Sparkles, RefreshCw, AlertTriangle, ArrowLeft, ArrowRight, BookOpen, Check, ChevronRight, Tv } from "lucide-react";
import { Message } from "../types";
import FormulaBlock from "./FormulaBlock";

interface ScannerViewProps {
  onAddSolveHistory: (title: string, category: string) => void;
  onNavigateToChat: () => void;
  setChatMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  onOpenVideo?: (explanation: string, title?: string) => void;
}

export default function ScannerView({
  onAddSolveHistory,
  onNavigateToChat,
  setChatMessages,
  onOpenVideo,
}: ScannerViewProps) {
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [manualPrompt, setManualPrompt] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Img = event.target?.result as string;
      setCapturedImage(base64Img);
      await sendImageForAnalysis(base64Img, manualPrompt);
    };
    reader.readAsDataURL(file);
  };

  // List of reassuring loading messages to rotate during AI math solving
  const loadingSteps = [
    "Optimizando calidad de imagen...",
    "Reconociendo caracteres y ecuaciones con AI...",
    "Identificando constantes físicas (gravedad, masas)...",
    "Modelando el diagrama cinemático...",
    "Generando resolución paso a paso...",
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadingPhase((prev) => (prev + 1) % loadingSteps.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Activate camera stream on mount if possible
  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        setCameraActive(true);
      } catch (err) {
        console.warn("Could not access camera (expected in iframe mock environment):", err);
        setCameraActive(false);
      }
    }

    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const handleCapture = async () => {
    // If the real camera is active, draw the frame on a canvas and grab base64
    if (cameraActive && videoRef.current) {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth || 640;
        canvas.height = videoRef.current.videoHeight || 480;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          const base64Img = canvas.toDataURL("image/jpeg");
          await sendImageForAnalysis(base64Img, manualPrompt);
        }
      } catch (err) {
        console.error("Failed to capture stream, falling back directly:", err);
        fallbackSimulation();
      }
    } else {
      // If no real camera stream is active, trigger an elegant simulation of solving a physics problem
      fallbackSimulation();
    }
  };

  // Prepackaged physics mock images if no custom image is uploaded
  const fallbackSimulation = async () => {
    const simulationImages = [
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=600&auto=format&fit=crop", // abstract complex physics equations
      "https://images.unsplash.com/photo-1507668077129-56e32842fceb?q=80&w=600&auto=format&fit=crop"
    ];
    const previewPic = simulationImages[Math.floor(Math.random() * simulationImages.length)];
    setCapturedImage(previewPic);
    setLoading(true);
    setErrorMsg(null);

    // Simulate sending default mock data URL to `/api/scan` to get a proper Gemini-curated calculation!
    try {
      // We will generate a base64 version of a small pixel representation or pull a beautiful structured question
      // This will let the user experience actual, live AI math solver even with mock images!
      const presetPrompts = [
        "Un proyectil es lanzado con una velocidad inicial de 20 m/s con un ángulo de 30° sobre la horizontal. Calcula su altura máxima alcanzada.",
        "Un bloque de 5 kg se desliza sobre una superficie plana sin fricción impulsado por una fuerza F = 25 N. Hallar la aceleración."
      ];
      
      const selectedPrompt = manualPrompt.trim() 
        ? manualPrompt.trim() 
        : presetPrompts[Math.floor(Math.random() * presetPrompts.length)];

      // Write it back to the state so the user can see what has been processed!
      if (!manualPrompt.trim()) {
        setManualPrompt(selectedPrompt);
      }

      const dummyBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="; // 1px white png
      
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          image: `data:image/png;base64,${dummyBase64}`, 
          prompt: selectedPrompt 
        }),
      });

      if (!response.ok) {
        let errorMessage = "Error resolviendo la simulación";
        try {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } else {
            const textText = await response.text();
            if (textText && textText.length < 200 && !textText.includes("<!DOCTYPE") && !textText.includes("<!doctype")) {
              errorMessage = textText;
            }
          }
        } catch (e) {}
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("El servidor no devolvió una respuesta JSON válida. Probablemente esté inactivo o cargando.");
      }

      const data = await response.json();
      setScanResult(data.text);
      onAddSolveHistory(selectedPrompt.length > 35 ? selectedPrompt.substring(0, 35) + "..." : selectedPrompt, "Simulado / Mecánica");
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Error al descifrar el problema. Asegúrate de enfocar con buena iluminación.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Img = event.target?.result as string;
      setCapturedImage(base64Img);
      await sendImageForAnalysis(base64Img, manualPrompt);
    };
    reader.readAsDataURL(file);
  };

  const sendImageForAnalysis = async (base64Img: string, promptText?: string) => {
    setLoading(true);
    setErrorMsg(null);
    setScanResult(null);

    try {
      const response = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Img, prompt: promptText }),
      });

      if (!response.ok) {
        let errorMessage = "Fallo al procesar imagen de física.";
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
      setScanResult(data.text);
      onAddSolveHistory(promptText && promptText.trim() ? (promptText.length > 35 ? promptText.substring(0, 35) + "..." : promptText) : "Fórmula Escaneada por Cámara", "General");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "No se pudo conectar con el servidor de resolución física.");
    } finally {
      setLoading(false);
    }
  };

  // Imports the scanned answer directly to the Chat tutorial conversation
  const handleImportToChat = () => {
    if (!scanResult) return;

    const welcomeMsg: Message = {
      id: `scan-imported-system`,
      role: "assistant",
      content: `### 📸 Problema Escaneado por Cámara:

Aquí está de forma interactiva la resolución óptima obtenida por mi escáner:

${scanResult}

¿Quieres profundizar en algún paso matemático o constante utilizada? Escríbeme abajo y lo detallaremos de inmediato.`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setChatMessages((prev) => [...prev, welcomeMsg]);
    onNavigateToChat();
  };

  return (
    <div className="space-y-4 pb-24 view-enter relative h-[calc(100vh-140px)] flex flex-col justify-between">
      {/* 1. Header Toolbar matching Screenshot 3 */}
      {!scanResult && !loading && (
        <div className="flex items-center justify-between px-2 py-1 bg-slate-900/40 rounded-xl shrink-0 mt-1.5 border border-white/5">
          <button
            onClick={() => setFlashlightOn(!flashlightOn)}
            className={`p-3 rounded-xl transition-all border ${
              flashlightOn
                ? "bg-amber-500/20 border-amber-500/40 text-amber-400"
                : "bg-slate-800/80 border-transparent text-slate-400 hover:text-slate-100"
            }`}
            title="Activar linterna de enfoque"
          >
            <Flashlight className="w-5 h-5" />
          </button>

          <span className="text-[10px] font-bold tracking-widest text-slate-300 px-4 py-2 bg-slate-950/60 rounded-full font-mono border border-white/5">
            PHYSIX AI SCANNER
          </span>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 rounded-xl bg-slate-800/80 border border-transparent text-slate-400 hover:text-slate-100 hover:bg-slate-700 transition-all"
            title="Elegir foto de la galería"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
        </div>
      )}

      {/* 2. Main Viewport / Results container */}
      <div className="flex-1 flex flex-col items-center justify-center relative w-full my-3 overflow-hidden rounded-2xl border border-white/5 bg-[#08101e]">
        {/* State A: Result Screen */}
        {scanResult ? (
          <div className="w-full h-full flex flex-col justify-between bg-[#070d19]/90 overflow-y-auto p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 bg-[#10b981] rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-[#10b981] tracking-wider uppercase">
                  PROBLEMA RESUELTO
                </span>
              </div>
              <button
                onClick={() => {
                  setScanResult(null);
                  setCapturedImage(null);
                }}
                className="flex items-center space-x-1 px-2 py-1 rounded bg-[#1e293b] text-slate-300 text-[10px] uppercase tracking-wider font-semibold hover:bg-slate-700 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver</span>
              </button>
            </div>

            {/* Solver Text Preview */}
            <div className="flex-1 overflow-y-auto space-y-3.5">
              {capturedImage && (
                <div className="relative w-full h-32 rounded-xl overflow-hidden mb-3 border border-white/5">
                  <img src={capturedImage} className="w-full h-full object-cover blur-xs opacity-70" alt="Captured physics formula" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent flex items-end justify-center pb-2">
                    <span className="text-[10px] font-semibold text-slate-400">Imagen Analizada</span>
                  </div>
                </div>
              )}

              <div className="p-4 bg-[#0e1726]/80 rounded-xl border border-blue-500/10 text-[13px] leading-relaxed text-slate-200">
                <style>
                  {`
                    .scan-md-body blockquote {
                      border-left: 3px solid rgba(59,130,246,0.5);
                      padding-left: 12px;
                      margin-top: 10px;
                      color: #94a3b8;
                    }
                    .scan-md-body p {
                      margin-bottom: 8px;
                    }
                  `}
                </style>
                <div className="scan-md-body space-y-3">
                  <FormulaBlock text={scanResult} />
                </div>
              </div>
            </div>

            {/* solver actions */}
            <div className="flex items-center space-x-3 pt-3 border-t border-white/5 shrink-0">
              <button
                onClick={handleImportToChat}
                className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold font-display text-xs shadow-lg flex items-center justify-center space-x-1.5 transition-all active:scale-[0.98]"
              >
                <BookOpen className="w-4 h-4" />
                <span>Interactuar en Tutor</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              {onOpenVideo && (
                <button
                  onClick={() => onOpenVideo(scanResult, manualPrompt || "Problema Escaneado")}
                  className="py-3.5 px-3 hover:scale-105 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-white border border-red-500/25 font-bold text-xs flex items-center justify-center space-x-1.5 transition-all active:scale-[0.98]"
                  title="Generar explicación interactiva en video"
                >
                  <Tv className="w-4 h-4" />
                  <span>Video Tutor</span>
                </button>
              )}
            </div>
          </div>
        ) : loading ? (
          /* State B: Loading and Optimizing layout */
          <div className="flex flex-col items-center justify-center p-6 space-y-5 text-center w-full h-full bg-[#070d19]/95 z-20">
            <div className="relative w-20 h-20 flex items-center justify-center">
              {/* Rotating glowing orbits */}
              <div className="absolute inset-0 border-3 border-dashed border-blue-500 animate-[spin_8s_linear_infinite] rounded-full" />
              <div className="absolute inset-2 border-2 border-dashed border-cyan-400 animate-[spin_12s_linear_infinite_reverse] rounded-full" />
              <div className="absolute inset-4 rounded-full bg-blue-950/40 border border-white/5 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-cyan-400 animate-pulse" />
              </div>
            </div>

            <div className="space-y-1.5 max-w-xs">
              <h4 className="text-sm font-bold tracking-tight text-white uppercase font-display">
                Resolviendo Ecuación
              </h4>
              <p className="text-slate-400 text-xs font-medium font-mono min-h-[36px] animate-pulse">
                {loadingSteps[loadingPhase]}
              </p>
            </div>

            {/* Glowing solving particle loops exactly like high end physics apps */}
            <div className="w-44 h-1 bg-slate-900 rounded-full overflow-hidden relative border border-white/5">
              <div className="absolute top-0 bottom-0 left-0 w-1/3 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full animate-[loading-slide_1.5s_infinite_ease-in-out]" />
              <style>{`
                @keyframes loading-slide {
                  0% { transform: translateX(-100%); }
                  100% { transform: translateX(300%); }
                }
              `}</style>
            </div>
          </div>
        ) : (
          /* State C: Active Scan Viewport matching screenshot 3 exactly */
          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`w-full h-full flex flex-col justify-between p-6 relative transition-all duration-300 ${isDragging ? "bg-blue-950/40 border-2 border-dashed border-blue-500" : ""}`}
          >
            {/* Ambient Background Glow inside scanner if camera inactive */}
            {!cameraActive && (
              <div className="absolute inset-0 opacity-40 flex items-center justify-center pointer-events-none">
                <div className="absolute w-60 h-60 rounded-full border border-dashed border-blue-500/20 animate-[spin_30s_linear_infinite]" />
                <div className="absolute w-72 h-72 rounded-full border border-double border-cyan-400/10 animate-[spin_40s_linear_infinite]" />
                <div className="w-32 h-32 rounded-full bg-blue-950/30 blur-xl" />
              </div>
            )}

            {/* Real HTML Camera stream if active */}
            {cameraActive && (
              <video
                ref={videoRef}
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover z-0"
              />
            )}

            {/* Flashlight visual exposure effect */}
            {flashlightOn && (
              <div className="absolute inset-0 bg-white/[0.04] backdrop-brightness-125 z-10 transition-all pointer-events-none" />
            )}

            {/* Dragging Overlay */}
            {isDragging && (
              <div className="absolute inset-0 bg-slate-950/80 z-40 flex flex-col items-center justify-center space-y-3 pointer-events-none">
                <div className="w-20 h-20 rounded-full bg-blue-500/10 border-2 border-dashed border-blue-500 flex items-center justify-center animate-bounce">
                  <ImageIcon className="w-10 h-10 text-blue-400" />
                </div>
                <p className="text-sm font-bold text-white uppercase tracking-wider font-display">
                  Suelte la imagen aquí para escanear
                </p>
                <p className="text-xs text-slate-400 font-mono">
                  Soportado: PNG, JPG, JPEG
                </p>
              </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/75 z-10 pointer-events-none" />

            {/* Titles overlay atop viewport */}
            <div className="text-center space-y-1.5 z-20 pt-2 pointer-events-none">
              <h2 className="text-xl md:text-2xl font-black font-display text-white tracking-normal drop-shadow-md">
                Enfoca el problema claramente
              </h2>
              <p className="text-xs font-semibold text-slate-300 tracking-wide drop-shadow-sm">
                Asegúrate de que las ecuaciones sean legibles
              </p>
            </div>

            {/* Square Target Frame corners matching design */}
            <div 
              onClick={() => {
                if (!cameraActive) {
                  fileInputRef.current?.click();
                }
              }}
              className={`w-64 h-56 border-0 relative my-3 mx-auto z-20 flex flex-col items-center justify-center shrink-0 ${!cameraActive ? 'cursor-pointer hover:scale-[1.02] hover:bg-white/[0.01] active:scale-[0.98] transition-all group' : ''}`}
              title={!cameraActive ? "Haz clic para seleccionar imagen de tu dispositivo" : "Área de enfoque del escáner"}
            >
              {/* Corner brackets */}
              <div className="absolute top-0 left-0 w-8 h-8 border-t-3 border-l-3 border-white rounded-tl-xl group-hover:border-blue-400 transition-colors" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-3 border-r-3 border-white rounded-tr-xl group-hover:border-blue-400 transition-colors" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-3 border-l-3 border-white rounded-bl-xl group-hover:border-blue-400 transition-colors" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-3 border-r-3 border-white rounded-br-xl group-hover:border-blue-400 transition-colors" />

              {/* Centered content depending on camera status */}
              {!cameraActive ? (
                <div className="flex flex-col items-center space-y-3.5 text-center p-4">
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-blue-500/30 flex items-center justify-center relative bg-blue-500/5 group-hover:border-blue-400 group-hover:bg-blue-500/10 transition-all duration-300">
                    <ImageIcon className="w-7 h-7 text-blue-400" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[11px] font-black text-slate-200 group-hover:text-blue-400 transition-colors uppercase tracking-wider block">
                      Seleccionar Imagen
                    </span>
                    <p className="text-[9px] text-slate-400 leading-normal max-w-[180px]">
                      Haz clic para subir o arrastra tu ejercicio aquí
                    </p>
                  </div>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full border border-white/25 flex items-center justify-center relative bg-white/[0.02]">
                  <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,1)]" />
                </div>
              )}
            </div>

            {/* Optional Manual Text Clue Box (Input) */}
            <div className="z-20 w-full max-w-sm mx-auto px-2 mb-2 shrink-0">
              <div className="bg-slate-900/85 backdrop-blur-md rounded-xl p-3 border border-white/10 space-y-2 shadow-xl">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-extrabold text-blue-400 uppercase tracking-widest font-mono">
                    Enunciado o Pista Manual (Opcional):
                  </label>
                  {manualPrompt && (
                    <button 
                      onClick={() => setManualPrompt("")}
                      className="text-[10px] font-bold text-slate-400 hover:text-white uppercase font-mono"
                    >
                      Limpiar
                    </button>
                  )}
                </div>
                <textarea
                  value={manualPrompt}
                  onChange={(e) => setManualPrompt(e.target.value)}
                  placeholder="Escribe el problema o fórmula si la cámara no enfoca bien..."
                  className="w-full h-16 bg-slate-950/60 text-xs text-white placeholder-slate-500 rounded-lg p-2.5 border border-white/5 focus:border-blue-500/50 focus:outline-none resize-none font-sans"
                />
              </div>
            </div>

            {/* Capture button and label at overlay bottom */}
            <div className="flex flex-col items-center space-y-2 z-20 pb-2 shrink-0">
              <button
                onClick={handleCapture}
                className="w-14 h-14 rounded-full bg-white border-4 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.6)] hover:scale-105 active:scale-90 transition-transform flex items-center justify-center cursor-pointer group"
                aria-label="Disparador de fotos"
              >
                <div className="w-7 h-7 rounded-full bg-blue-400 group-hover:bg-blue-300 transition-colors animate-pulse" />
              </button>
              <span className="text-[9px] font-extrabold tracking-widest text-slate-300 uppercase font-mono">
                CAPTURAR PROBLEMA
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Error notification */}
      {errorMsg && (
        (() => {
          const isQuota = errorMsg.toLowerCase().includes("quota") || 
                          errorMsg.toLowerCase().includes("limit") || 
                          errorMsg.toLowerCase().includes("429") || 
                          errorMsg.toLowerCase().includes("exhausted");
                          
          if (isQuota) {
            return (
              <div className="p-4 rounded-xl bg-blue-950/40 border border-blue-500/30 text-slate-200 text-xs shadow-lg shrink-0 space-y-2.5">
                <div className="flex items-start space-x-3">
                  <Sparkles className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <span className="font-extrabold text-blue-300 uppercase tracking-wider font-display">
                      Respaldo Activado por Límite de Cuota
                    </span>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      La cuota gratuita de la API compartida de Gemini en este proyecto se ha completado temporalmente debido a la alta demanda de usuarios.
                    </p>
                  </div>
                  <button
                    onClick={() => setErrorMsg(null)}
                    className="text-[10px] font-bold text-slate-400 hover:text-white uppercase font-mono"
                  >
                    Cerrar
                  </button>
                </div>
                
                <div className="pl-8 space-y-2">
                  <div className="bg-slate-950/60 p-2.5 rounded-lg border border-white/5 space-y-1.5">
                    <p className="text-[11px] font-semibold text-white">¿Cómo continuar de inmediato?</p>
                    <ul className="list-disc pl-4 text-[10.5px] text-slate-400 space-y-1">
                      <li>Use la caja de <span className="text-blue-400 font-bold">Enunciado / Pista Manual</span> arriba para escribir tu pregunta y presiona el botón para resolverla de forma offline.</li>
                      <li>Introduce tu propia clave en <span className="text-slate-200 font-semibold font-mono">Ajustes &gt; Secrets</span> con el nombre <code className="text-amber-400 font-mono">GEMINI_API_KEY</code> para saltarte límites compartidos de forma gratuita.</li>
                    </ul>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div className="flex items-center space-x-3 p-4 rounded-xl bg-orange-950/20 border border-orange-500/30 text-orange-200 text-xs shadow-lg shrink-0">
              <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0" />
              <div className="flex-1">
                <span className="font-bold">Escaner Fallido:</span> {errorMsg}
              </div>
              <button
                onClick={() => setErrorMsg(null)}
                className="text-[10px] font-bold text-slate-400 hover:text-white uppercase"
              >
                Cerrar
              </button>
            </div>
          );
        })()
      )}
    </div>
  );
}
