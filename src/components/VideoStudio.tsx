import React, { useState, useEffect, useRef } from "react";
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Sparkles, 
  X, 
  Tv, 
  Trophy, 
  Eye, 
  Download,
  Check,
  ChevronRight,
  Gauge,
  Image
} from "lucide-react";
import { cleanPhysicsFormula } from "./FormulaBlock";

// Curated high-resolution educational and scientific physics reference visuals representing AI-generated blueprints and real world photos
const getVisualAssets = (catStr: string, titleStr: string, explStr: string) => {
  const lowCategory = (catStr || "").toLowerCase();
  const lowTitle = (titleStr || "").toLowerCase();
  const lowExpl = (explStr || "").toLowerCase();

  if (lowCategory.includes("vect") || lowTitle.includes("vect") || lowExpl.includes("vect") || lowExpl.includes("vector")) {
    return {
      categoryName: "Vectores y Álgebra Vectorial",
      schematic: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80",
      realWorld: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=1200&q=80",
      description: "Representación tridimensional de fuerzas coplanares y resultantes."
    };
  } else if (lowCategory.includes("mec") || lowCategory.includes("cin") || lowCategory.includes("din")) {
    return {
      categoryName: "Mecánica de Sólidos y Fluidos",
      schematic: "https://images.unsplash.com/photo-1461360370896-922624d12aa1?auto=format&fit=crop&w=1200&q=80",
      realWorld: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1200&q=80",
      description: "Diagrama de cinemática clásica, aceleración gravitacional y leyes de Newton."
    };
  } else if (lowCategory.includes("termo") || lowCategory.includes("calor")) {
    return {
      categoryName: "Termodinámica, Gases e Hidrodinámica",
      schematic: "https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=1200&q=80",
      realWorld: "https://images.unsplash.com/photo-1532187863486-abf9d39d66e8?auto=format&fit=crop&w=1200&q=80",
      description: "Transferencia de calor por radiación y distribución molecular de gas ideal."
    };
  } else if (lowCategory.includes("opti") || lowCategory.includes("luz") || lowCategory.includes("onda")) {
    return {
      categoryName: "Óptica Geométrica y Ondas Electromagnéticas",
      schematic: "https://images.unsplash.com/photo-1534972195531-d756b9bda9f2?auto=format&fit=crop&w=1200&q=80",
      realWorld: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
      description: "Desviación angular y refracción espectral mediante lentes de Snell."
    };
  } else {
    return {
      categoryName: "Electromagnetismo y Estructura Atómica",
      schematic: "https://images.unsplash.com/photo-1614064641938-3bbee52942c7?auto=format&fit=crop&w=1200&q=80",
      realWorld: "https://images.unsplash.com/photo-1517420784537-d242a790f9e0?auto=format&fit=crop&w=1200&q=80",
      description: "Simulación de líneas de fuerza del campo eléctrico y flujo de inducción de Lorentz."
    };
  }
};

interface VideoStudioProps {
  title: string;
  explanation: string;
  category?: string;
  onClose: () => void;
}

export default function VideoStudio({ title, explanation, category = "Mecánica", onClose }: VideoStudioProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [speechRate, setSpeechRate] = useState(1);
  const [voiceGender, setVoiceGender] = useState<"male" | "female" | "robot">("female");
  const [isMuted, setIsMuted] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);
  const [simProgress, setSimProgress] = useState(0); // for animating physics objects on canvas
  const [chapters, setChapters] = useState<{ id: string; title: string; text: string; duration?: number; equations?: string[] }[]>([]);
  const [isLoadingScript, setIsLoadingScript] = useState(true);
  const [studioMode, setStudioMode] = useState<"blackboard" | "diagram">("blackboard");
  const [aiFilter, setAiFilter] = useState<"none" | "hologram" | "quantum" | "blueprint">("hologram");
  const [visualFeed, setVisualFeed] = useState<"interactive" | "ai_schematic" | "real_world">("interactive");
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const timeRef = useRef<number>(0);

  const assets = getVisualAssets(category, title, explanation);

  // Fallback extraction of equations for the chalkboard if API hasn't loaded them
  const getFallbackEquations = (fullText: string, stepIdx: number): string[] => {
    const lowTitle = (title || "").toLowerCase();
    
    if (stepIdx === 0) {
      return [
        title,
        `Tema: ${category || "Física General"}`,
        "Fundamento: Análisis dimensional y leyes de estado"
      ];
    }
    
    if (stepIdx === 1) {
      const numbers = fullText.match(/\d+(\.\d+)?\s*(m\/s|m\/s²|kg|s|m|N|J|W|°C|K|V|Ω|A)/gi) || [];
      const lines = numbers.slice(0, 4).map(num => `• Dato extraído: ${num}`);
      if (lines.length === 0) {
        return [
          "Identificación de datos:",
          "• Constantes del sistema",
          "• Parámetros de masa, aceleración y tiempo"
        ];
      }
      return ["Parámetros del Sistema:", ...lines];
    }
    
    if (stepIdx === 2) {
      const formulaRegex = /\[FORMULA\]([\s\S]*?)\[\/FORMULA\]/g;
      const formulas: string[] = [];
      let match;
      while ((match = formulaRegex.exec(fullText)) !== null && formulas.length < 3) {
        const parts = match[1].split("---")[0].trim();
        if (parts) formulas.push(cleanPhysicsFormula(parts));
      }
      if (formulas.length === 0) {
        const cat = (category || "").toLowerCase();
        if (cat.includes("mec") || cat.includes("cin") || lowTitle.includes("movimiento") || lowTitle.includes("caida") || lowTitle.includes("vector")) {
          return [
            "Fórmulas rectoras:",
            "v̄(t) = dr̄ / dt (Velocidad instantánea)",
            "ā(t) = dv̄ / dt (Aceleración instantánea)"
          ];
        } else if (cat.includes("termo")) {
          return [
            "Leyes termodinámicas:",
            "P · V = n · R · T (Gas Ideal)",
            "ΔU = Q - W (Primera Ley)"
          ];
        }
        return [
          "Modelo físico matemático:",
          "Relaciones de conservación de energía",
          "Resultante ΣF = m · a"
        ];
      }
      return ["Modelado de Ecuaciones:", ...formulas];
    }
    
    if (stepIdx === 3) {
      const lines = fullText.split("\n")
        .map(l => l.trim())
        .filter(l => l.includes("=") && (l.match(/\d/) || l.includes("+") || l.includes("-")))
        .slice(0, 3);
      if (lines.length === 0) {
        return [
          "Sustitución y Cálculo:",
          "• Despeje de variables incógnitas",
          "• Resolución numérica del sistema"
        ];
      }
      return ["Sustitución y Operaciones:", ...lines];
    }
    
    // Conclusion
    const finalResults = fullText.split("\n")
      .map(l => l.trim())
      .filter(l => l.toLowerCase().includes("resultado") || l.toLowerCase().includes("final") || l.includes("=") && l.match(/\d/))
      .slice(-2);
    
    const baseSummary = [
      "Resumen de Resultados:",
      "1) v̄(t) = dr̄ / dt",
      "2) ā(t) = dv̄ / dt",
      "3) Evaluación en t = 1.00 s"
    ];
    if (finalResults.length > 0) {
      return [...baseSummary, ...finalResults];
    }
    return baseSummary;
  };

  // Parse the explanation into educational "video scenes" for sequential narration
  const createVideoChapters = (fullText: string) => {
    // Standard chapters to structure ANY complex physics problem
    const chapters = [
      {
        id: "intro",
        title: "1. Introducción y Concepto",
        text: "",
        duration: 8000,
      },
      {
        id: "data",
        title: "2. Extracción de Datos",
        text: "",
        duration: 9000,
      },
      {
        id: "formula",
        title: "3. Formulación Física",
        text: "",
        duration: 10000,
      },
      {
        id: "solve",
        title: "4. Resolución y Operaciones",
        text: "",
        duration: 12000,
      },
      {
        id: "conclusion",
        title: "5. Conclusión y Errores Comunes",
        text: "",
        duration: 8000,
      }
    ];

    // Clean markdown and formula tags for natural voice synthesis
    const cleanForSpeech = (raw: string) => {
      return raw
        .replace(/\[FORMULA\]/g, "Fórmula: ")
        .replace(/\[\/FORMULA\]/g, ". ")
        .replace(/---/g, " donde ")
        .replace(/\$/g, "")
        .replace(/^[-\s*]+/gm, "")
        .replace(/\\Delta/g, "Delta ")
        .replace(/\\text\s*\{([^}]+)\}/g, "$1")
        .replace(/\\mathrm\s*\{([^}]+)\}/g, "$1")
        .replace(/\\frac\s*\{([^}]+)\}\s*\{([^}]+)\}/g, "$1 dividido entre $2")
        .replace(/v_f/g, "velocidad final")
        .replace(/v_o/g, "velocidad inicial")
        .replace(/x_f/g, "posición final")
        .replace(/x_o/g, "posición inicial")
        .replace(/\s+/g, " ")
        .trim();
    };

    // Distribute original text parts to standard chapters
    const blocks = fullText.split("\n\n").map(b => b.trim()).filter(Boolean);
    
    let currentBlockIdx = 0;
    chapters.forEach((chapter, index) => {
      let content = "";
      // Grab 1 or 2 blocks of user text per chapter
      const takeCount = index === 3 ? 3 : 2; // more detail to resolution
      for (let k = 0; k < takeCount; k++) {
        if (currentBlockIdx < blocks.length) {
          content += blocks[currentBlockIdx] + "\n\n";
          currentBlockIdx++;
        }
      }
      
      // Defaults if text is too short or sparse
      if (!content.trim()) {
        if (index === 0) content = `Hola, hoy analizaremos paso a paso el problema de física titulado: ${title}. Entenderemos cada fenómeno físico sin cabos sueltos.`;
        else if (index === 1) content = "Comencemos identificando las constantes físicas conocidas y los supuestos de partida para la resolución.";
        else if (index === 2) content = "Planteamos las ecuaciones de estado y fórmulas características que relacionan las variables físicas.";
        else if (index === 3) content = "Realizaremos las sustituciones algebraicas, llevando a cabo sumas, restas y despejes de forma rigurosa.";
        else content = "Recuerda repasar siempre las unidades resultantes para evitar errores conceptuales en tus exámenes.";
      }

      chapter.text = cleanForSpeech(content);
    });

    return chapters;
  };

  // Generate or fetch explanatory video script
  useEffect(() => {
    let active = true;
    async function loadScientificScript() {
      try {
        const response = await fetch("/api/generate-video-script", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title, explanation, category }),
        });
        if (response.ok) {
          const data = await response.json();
          if (active && data && Array.isArray(data.chapters)) {
            setChapters(data.chapters);
            setIsLoadingScript(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Falla al generar guion inteligente por API. Usando generador local offline:", err);
      }
      if (active) {
        setChapters(createVideoChapters(explanation));
        setIsLoadingScript(false);
      }
    }
    loadScientificScript();
    
    return () => {
      active = false;
    };
  }, [title, explanation, category]);

  // Stop sound narration if component unmounts or chapters change
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  // Update voice narration when index changes
  const speakChapter = (index: number) => {
    if (!window.speechSynthesis) return;
    
    // Stop any existing speech
    window.speechSynthesis.cancel();

    if (isMuted) return;

    const chapterText = `${chapters[index].title}. ${chapters[index].text}`;
    const utterance = new SpeechSynthesisUtterance(chapterText);
    utteranceRef.current = utterance;

    // Try finding spanish language voice
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = voices.find(v => v.lang.startsWith("es-") || v.lang.startsWith("es"));
    
    // Customize pitch/rate based on Narrator Mode Chosen
    if (voiceGender === "robot") {
      utterance.pitch = 0.5;
      utterance.rate = speechRate * 0.9;
    } else if (voiceGender === "male") {
      // Find a male voice if available or adjust pitch
      const maleVoice = voices.find(v => v.lang.startsWith("es") && (v.name.toLowerCase().includes("male") || v.name.toLowerCase().includes("julio") || v.name.toLowerCase().includes("jorge")));
      if (maleVoice) selectedVoice = maleVoice;
      utterance.pitch = 0.8;
      utterance.rate = speechRate;
    } else {
      // Female voice
      const femaleVoice = voices.find(v => v.lang.startsWith("es") && (v.name.toLowerCase().includes("female") || v.name.toLowerCase().includes("helena") || v.name.toLowerCase().includes("sara") || v.name.toLowerCase().includes("sabina")));
      if (femaleVoice) selectedVoice = femaleVoice;
      utterance.pitch = 1.1;
      utterance.rate = speechRate;
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.lang = "es-ES";

    utterance.onend = () => {
      // Go to next scene if playing and it exists
      if (index < chapters.length - 1) {
        setCurrentStep(index + 1);
      } else {
        setIsPlaying(false);
      }
    };

    utterance.onerror = (e) => {
      console.warn("Speech Synthesis warning/error:", e);
    };

    // Speak
    window.speechSynthesis.speak(utterance);
  };

  // Handle Play/Pause
  const handlePlayPause = () => {
    if (!window.speechSynthesis) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      speakChapter(currentStep);
    }
  };

  // Skip Chapter Reactivity
  useEffect(() => {
    timeRef.current = 0;
    if (isPlaying) {
      speakChapter(currentStep);
    }
  }, [currentStep, voiceGender, speechRate, isMuted]);

  // Clean setup when voice settings change or is playing starts
  const changeStep = (idx: number) => {
    timeRef.current = 0;
    setCurrentStep(idx);
    if (!isPlaying) {
      // Just visually update
    }
  };

  // Trigger mute changes
  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      // resume or play
      setIsPlaying(true);
      speakChapter(currentStep);
    } else {
      setIsMuted(true);
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    }
  };

  // Timer for automatic visual slide transition if muted or when speech is skipped
  useEffect(() => {
    let timerId: any = null;
    
    if (isPlaying && isMuted && chapters.length > 0) {
      const currentChapterText = chapters[currentStep]?.text || "";
      // Calculate a realistic reading time based on word count (approx. 240ms per word + extra buffer for reading)
      const wordCount = currentChapterText.split(/\s+/).filter(Boolean).length;
      const duration = Math.max(6500, Math.min(18000, wordCount * 240 + 2500));
      
      timerId = setTimeout(() => {
        if (currentStep < chapters.length - 1) {
          setCurrentStep(prev => prev + 1);
        } else {
          setIsPlaying(false);
        }
      }, duration);
    }
    
    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [isPlaying, isMuted, currentStep, chapters]);

  // Physics visual simulator canvas painter loop
  useEffect(() => {
    const draw = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;
      
      ctx.clearRect(0, 0, w, h);
      
      // Stable continuous clock
      const t = timeRef.current;

      // Determine colors based on active play status
      const pulseColor = isPlaying ? "rgba(16, 185, 129, 0.85)" : "rgba(59, 130, 246, 0.85)";

      if (studioMode === "blackboard") {
        // --- 📝 HIGH-FIDELITY BLACKBOARD MODE ---
        ctx.save();
        
        // 1. Chalkboard Dark Velvet Background
        ctx.fillStyle = "#0a0c10"; // Very deep matte black slate
        ctx.fillRect(0, 0, w, h);

        // 2. Programmatic Worn-chalk Dust Textures (Adds extremely rich realistic chalkboard look)
        ctx.strokeStyle = "rgba(255, 255, 255, 0.015)";
        ctx.lineWidth = 1.5;
        // Horizontal eraser wipes
        for (let i = 0; i < 5; i++) {
          const yWipe = 80 + i * 75;
          ctx.beginPath();
          ctx.moveTo(15, yWipe);
          ctx.bezierCurveTo(w * 0.25, yWipe - 12, w * 0.75, yWipe + 12, w - 15, yWipe - 4);
          ctx.stroke();
        }

        // 3. Coordinate Guideline Grid (Very subtle science grid)
        ctx.strokeStyle = "rgba(56, 189, 248, 0.04)";
        ctx.lineWidth = 1;
        const gridStep = 25;
        for (let x = 15; x < w - 15; x += gridStep) {
          ctx.beginPath(); ctx.moveTo(x, 15); ctx.lineTo(x, h - 15); ctx.stroke();
        }
        for (let y = 15; y < h - 15; y += gridStep) {
          ctx.beginPath(); ctx.moveTo(15, y); ctx.lineTo(w - 15, y); ctx.stroke();
        }

        // 4. Polished Metallic Double Safety Border Frame
        ctx.strokeStyle = "rgba(59, 130, 246, 0.35)"; // Accent neon blue-green slate borders
        ctx.lineWidth = 3;
        ctx.strokeRect(10, 10, w - 20, h - 20);
        ctx.strokeStyle = "rgba(59, 130, 246, 0.15)";
        ctx.lineWidth = 1;
        ctx.strokeRect(14, 14, w - 28, h - 28);

        // 5. Beautiful Header (Title & Vector arrow markings)
        ctx.fillStyle = "#f8fafc";
        ctx.font = "bold 18px 'Space Grotesk', 'Inter', sans-serif";
        ctx.textAlign = "center";
        
        let truncatedTitle = title;
        if (truncatedTitle.length > 55) {
          truncatedTitle = truncatedTitle.substring(0, 52) + "...";
        }
        ctx.fillText(truncatedTitle, w / 2, 42);

        // Underline Separator
        ctx.strokeStyle = "rgba(148, 163, 184, 0.22)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(w / 2 - 190, 53);
        ctx.lineTo(w / 2 + 190, 53);
        ctx.stroke();

        // 6. Draw Accumulated Formulas Storyboard (From Chapter 0 up to currentStep)
        let yOffset = 90;
        ctx.textAlign = "left";

        const linesToDraw: { text: string; color: string; isCurrent: boolean; indexInStep: number }[] = [];

        for (let s = 0; s <= currentStep; s++) {
          const chap = chapters[s];
          if (!chap) continue;
          
          const eqList = chap.equations || getFallbackEquations(explanation, s);
          
          eqList.forEach((rawLine, eqIdx) => {
            let color = "#e2e8f0"; // Default formulas are white
            const lineLow = rawLine.toLowerCase();

            // Match colors to variables precisely mapping user reference screenshot
            if (lineLow.includes("posición") || lineLow.includes("posicion") || lineLow.startsWith("r̄(") || lineLow.startsWith("r(")) {
              color = "#ffffff"; // Position vector/status -> White
            } else if (lineLow.includes("velocidad") || lineLow.startsWith("v̄(") || lineLow.startsWith("v(")) {
              color = "#38bdf8"; // Velocity vector/status -> Sky Blue
            } else if (lineLow.includes("aceleración") || lineLow.includes("aceleracion") || lineLow.startsWith("ā(") || lineLow.startsWith("a(")) {
              color = "#facc15"; // Acceleration vector/status -> Yellow Gold
            } else if (lineLow.startsWith("resumen") || lineLow.includes("datos conocidos") || lineLow.includes("parámetros") || lineLow.includes("modelo físico") || lineLow.includes("identificación")) {
              color = "#c084fc"; // Section titles/headers -> Warm Violet
            } else if (lineLow.startsWith("1)")) {
              color = "#38bdf8"; // Blue list
            } else if (lineLow.startsWith("2)")) {
              color = "#facc15"; // Yellow list
            } else if (lineLow.startsWith("3)") || lineLow.startsWith("• dato")) {
              color = "#94a3b8"; // Gray evaluation text
            }

            linesToDraw.push({
              text: rawLine,
              color,
              isCurrent: s === currentStep,
              indexInStep: eqIdx
            });
          });
        }

        // Shifting window buffer to prevent vertical canvas overflows
        const maxLines = 13;
        let renderedLines = linesToDraw;
        if (linesToDraw.length > maxLines) {
          renderedLines = linesToDraw.slice(linesToDraw.length - maxLines);
        }

        renderedLines.forEach((line) => {
          if (line.isCurrent) {
            // Write effect: each line staggered by 45 frames
            const startFrame = line.indexInStep * 45;
            const elapsedFrames = t - startFrame;

            if (elapsedFrames <= 0) return; // Not started yet

            // Char typing factor: 1.2 frames per character for snappy fluid responsive text
            const textLength = line.text.length;
            const visibleCharCount = Math.min(textLength, Math.floor(elapsedFrames / 1.2));
            const typedText = line.text.substring(0, visibleCharCount);

            ctx.fillStyle = line.color;
            ctx.font = "bold 14px 'Fira Code', 'JetBrains Mono', monospace";
            ctx.fillText(typedText, 45, yOffset);

            // Glowing chalk active point cursor!
            if (visibleCharCount < textLength && isPlaying) {
              const textWidth = ctx.measureText(typedText).width;
              ctx.shadowColor = line.color;
              ctx.shadowBlur = 8;
              ctx.fillStyle = line.color;
              ctx.beginPath();
              // random vibration of chalk dot
              const vibSign = Math.sin(t * 0.6) * 1.5;
              ctx.arc(45 + textWidth + 4, yOffset - 4 + vibSign, 3.5, 0, Math.PI * 2);
              ctx.fill();
              ctx.shadowBlur = 0; // reset
            }

            yOffset += 24;
          } else {
            // Already written previously steps are rendered instantly static
            ctx.fillStyle = line.color;
            ctx.font = "bold 14px 'Fira Code', 'JetBrains Mono', monospace";
            ctx.fillText(line.text, 45, yOffset);
            yOffset += 24;
          }
        });

        // 7. Interactive timeline and Player hud overlays
        ctx.fillStyle = "rgba(10, 15, 30, 0.65)";
        ctx.fillRect(w - 240, h - 35, 220, 20);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
        ctx.strokeRect(w - 240, h - 35, 220, 20);
        
        ctx.fillStyle = "#94a3b8";
        ctx.font = "10px monospace";
        ctx.textAlign = "right";
        ctx.fillText(`Cáp. ${currentStep + 1}/5 · Video Solución • Paso a Paso`, w - 30, h - 22);

        ctx.restore();
      } else {
        // --- 🔬 ORIGINAL DIAGRAMS SANDBOX SIMULATIONS ---
        const lowCategory = (category || "").toLowerCase();
        const lowTitle = (title || "").toLowerCase();
        const lowExpl = (explanation || "").toLowerCase();

        // Background Grid (Chalkboard visualizer style)
        ctx.strokeStyle = "rgba(59, 130, 246, 0.06)";
        ctx.lineWidth = 1;
        const gridSize = 25;
        for (let x = 0; x < w; x += gridSize) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, h);
          ctx.stroke();
        }
        for (let y = 0; y < h; y += gridSize) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(w, y);
          ctx.stroke();
        }

        if (lowCategory.includes("vect") || lowTitle.includes("vect") || lowExpl.includes("vect") || lowExpl.includes("vector")) {
          // --- VECTORS INTERACTIVE SIMULATION (Cartesian Vector Addition) ---
          ctx.save();

          const centerX = w / 2;
          const centerY = h / 2 + 10;
          const scale = 1.3; // multiplier to scale vectors visually

          // Draw Cartesian Grid Axes
          ctx.strokeStyle = "rgba(148, 163, 184, 0.2)";
          ctx.lineWidth = 1;
          // Minor grid lines relative to center
          const spacing = 35;
          ctx.strokeStyle = "rgba(148, 163, 184, 0.08)";
          for (let i = -5; i <= 5; i++) {
            if (i === 0) continue;
            // Vertical lines
            ctx.beginPath();
            ctx.moveTo(centerX + i * spacing, 30);
            ctx.lineTo(centerX + i * spacing, h - 30);
            ctx.stroke();
            // Horizontal lines
            ctx.beginPath();
            ctx.moveTo(30, centerY + i * spacing);
            ctx.lineTo(w - 30, centerY + i * spacing);
            ctx.stroke();
          }

          // Draw coordinate axes
          ctx.strokeStyle = "rgba(148, 163, 184, 0.55)";
          ctx.lineWidth = 1.5;
          // X Axis
          ctx.beginPath();
          ctx.moveTo(30, centerY);
          ctx.lineTo(w - 30, centerY);
          ctx.stroke();
          // Y Axis
          ctx.beginPath();
          ctx.moveTo(centerX, 30);
          ctx.lineTo(centerX, h - 30);
          ctx.stroke();

          // Draw Axis markings
          ctx.fillStyle = "#94a3b8";
          ctx.font = "italic bold 10px sans-serif";
          ctx.fillText("X", w - 25, centerY + 3);
          ctx.fillText("Y", centerX - 12, 28);
          ctx.font = "9px monospace";
          ctx.fillText("(0,0)", centerX - 18, centerY + 14);

          // Vector u (rose) oscillating over time
          const angleU = (t * 0.015) + Math.PI / 6;
          const lenU = 75;
          const ux = Math.cos(angleU) * lenU;
          const uy = -Math.sin(angleU) * lenU; // Canvas coordinate inversion (y is down)

          // Draw Vector u
          ctx.strokeStyle = "#f43f5e"; // rose-500
          ctx.lineWidth = 3.5;
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(centerX + ux, centerY + uy);
          ctx.stroke();
          
          // Arrow head helper
          const drawArrowHead = (cx: CanvasRenderingContext2D, fromX: number, fromY: number, toX: number, toY: number, color: string) => {
            const headlen = 9;
            const dx = toX - fromX;
            const dy = toY - fromY;
            const angle = Math.atan2(dy, dx);
            cx.strokeStyle = color;
            cx.fillStyle = color;
            cx.lineWidth = 2.5;
            cx.beginPath();
            cx.moveTo(toX, toY);
            cx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
            cx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
            cx.closePath();
            cx.fill();
          };
          drawArrowHead(ctx, centerX, centerY, centerX + ux, centerY + uy, "#f43f5e");

          // Vector v (blue) oscillating at offset
          const angleV = (-t * 0.009) + Math.PI / 4;
          const lenV = 55;
          const vx = Math.cos(angleV) * lenV;
          const vy = -Math.sin(angleV) * lenV;

          // Draw Vector v from the tip of Vector u (Tip-to-Tail addition)
          const startVX = centerX + ux;
          const startVY = centerY + uy;
          const endVX = startVX + vx;
          const endVY = startVY + vy;

          ctx.strokeStyle = "#3b82f6"; // blue-500
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(startVX, startVY);
          ctx.lineTo(endVX, endVY);
          ctx.stroke();
          drawArrowHead(ctx, startVX, startVY, endVX, endVY, "#3b82f6");

          // Draw Resultant Vector R = u + v (green) from origin to the final tip!
          ctx.strokeStyle = "#10b981"; // emerald-500
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          ctx.lineTo(endVX, endVY);
          ctx.stroke();
          drawArrowHead(ctx, centerX, centerY, endVX, endVY, "#10b981");

          // Text labels on canvas
          ctx.font = "bold 11px sans-serif";
          ctx.fillStyle = "#f43f5e";
          ctx.fillText("ū", centerX + ux / 2 - 12, centerY + uy / 2 - 8);

          ctx.fillStyle = "#3b82f6";
          ctx.fillText("v̄", startVX + vx / 2 + 10, startVY + vy / 2);

          ctx.fillStyle = "#10b981";
          ctx.font = "bold 12px sans-serif";
          ctx.fillText("R̄ = ū + v̄", (centerX + endVX) / 2 - 40, (centerY + endVY) / 2 + 25);

          // Angle and numeric value dashboard
          ctx.fillStyle = "rgba(15, 23, 42, 0.85)";
          ctx.fillRect(20, 35, 175, 75);
          ctx.strokeStyle = "rgba(148, 163, 184, 0.25)";
          ctx.lineWidth = 1;
          ctx.strokeRect(20, 35, 175, 75);

          ctx.fillStyle = "#e2e8f0";
          ctx.font = "bold 10px sans-serif";
          ctx.fillText("Componentes de Vectores:", 28, 48);
          ctx.font = "9px monospace";
          ctx.fillStyle = "#f43f5e";
          ctx.fillText(`ū  = [${(ux / scale).toFixed(1)}, ${(-uy / scale).toFixed(1)}]`, 28, 62);
          ctx.fillStyle = "#3b82f6";
          ctx.fillText(`v̄  = [${(vx / scale).toFixed(1)}, ${(-vy / scale).toFixed(1)}]`, 28, 76);
          ctx.fillStyle = "#10b981";
          ctx.fillText(`R̄  = [${((ux + vx) / scale).toFixed(1)}, ${(-(uy + vy) / scale).toFixed(1)}]`, 28, 92);

          ctx.restore();
        } else if (lowCategory.includes("mec") || lowCategory.includes("cin") || lowCategory.includes("din")) {
          // --- KINEMATICS / MECHANICS SLIDING BLOCK OSCILLATION ---
          ctx.save();
          
          // Ground line
          ctx.strokeStyle = "#475569";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(30, h - 50);
          ctx.lineTo(w - 30, h - 50);
          ctx.stroke();

          // Moving block
          const blockWidth = 50;
          const blockHeight = 40;
          const originX = 50;
          const amplitude = (w - 150);
          const cycleProgress = (t % 200) / 200;
          
          // Kinetic curve math (harmonic trajectory)
          const xPos = originX + (1 - Math.cos(cycleProgress * Math.PI * 2)) / 2 * amplitude;
          const yPos = h - 50 - blockHeight;

          // Block Body
          ctx.fillStyle = "rgba(14, 116, 144, 0.4)";
          ctx.strokeStyle = "#06b6d4";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(xPos, yPos, blockWidth, blockHeight, 6);
          ctx.fill();
          ctx.stroke();

          // Weight & Normal vectors drawing
          ctx.strokeStyle = "#ef4444"; // red gravity
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(xPos + 25, yPos + 20);
          ctx.lineTo(xPos + 25, yPos + 70); // down
          ctx.stroke();
          
          // arrow tip down
          ctx.beginPath();
          ctx.moveTo(xPos + 20, yPos + 64);
          ctx.lineTo(xPos + 25, yPos + 70);
          ctx.lineTo(xPos + 30, yPos + 64);
          ctx.stroke();
          ctx.fillStyle = "#ef4444";
          ctx.font = "bold 9px monospace";
          ctx.fillText("P (W)", xPos + 32, yPos + 68);

          // Force Applied Vector
          ctx.strokeStyle = "#10b981"; // green Force
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(xPos - 30, yPos + 20);
          ctx.lineTo(xPos, yPos + 20); // right pointing force
          ctx.stroke();
          
          // arrow tip force
          ctx.beginPath();
          ctx.moveTo(xPos - 6, yPos + 16);
          ctx.lineTo(xPos, yPos + 20);
          ctx.lineTo(xPos - 6, yPos + 24);
          ctx.stroke();
          ctx.fillStyle = "#10b981";
          ctx.fillText("F", xPos - 25, yPos + 10);

          ctx.restore();
        } else if (lowCategory.includes("termo") || lowCategory.includes("calor")) {
          // --- THERMODYNAMICS IDEAL GAS SIMULATION ---
          ctx.save();
          
          // Chamber walls
          ctx.strokeStyle = "#475569";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.rect(60, 30, w - 120, h - 80);
          ctx.stroke();

          // Piston bar
          const pistonY = 50 + (1 + Math.sin(t * 0.03)) * 30;
          ctx.fillStyle = "rgba(100, 116, 139, 0.8)";
          ctx.fillRect(62, pistonY, w - 124, 12);
          
          // Piston stem
          ctx.fillStyle = "#94a3b8";
          ctx.fillRect(w / 2 - 10, 10, 20, pistonY - 10);

          // Floating particle gas molecules bouncing
          const numParticles = 12;
          ctx.fillStyle = "#f59e0b"; // glowing thermodynamic orange
          for (let i = 0; i < numParticles; i++) {
            const partX = 75 + ((i * 37 + t * (0.8 + i*0.1)) % (w - 150));
            const heightRange = (h - 50) - (pistonY + 20);
            const partY = (pistonY + 20) + ((i * 47 + t * (0.5 + i*0.15)) % heightRange);
            
            ctx.beginPath();
            ctx.arc(partX, partY, 4, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.fillStyle = "#f59e0b";
          ctx.font = "bold 9px monospace";
          ctx.fillText("Q (Calor)", 75, h - 30);
          ctx.fillText("P • V = n • R • T", w - 170, h - 30);
          
          ctx.restore();
        } else if (lowCategory.includes("opti") || lowCategory.includes("luz") || lowCategory.includes("onda")) {
          // --- OPTICS RAY REFRACTION SIMULATION ---
          ctx.save();

          // Normal dashed perpendicular line
          ctx.strokeStyle = "rgba(148, 163, 184, 0.4)";
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(w / 2, 20);
          ctx.lineTo(w / 2, h - 20);
          ctx.stroke();
          ctx.setLineDash([]); // clear dash

          // Water/Glass bottom medium
          ctx.fillStyle = "rgba(14, 165, 233, 0.15)";
          ctx.fillRect(30, h / 2, w - 60, h / 2 - 20);
          ctx.strokeStyle = "#0ea5e9";
          ctx.beginPath();
          ctx.moveTo(30, h / 2);
          ctx.lineTo(w - 30, h / 2);
          ctx.stroke();

          // Incident light ray
          const incAngle = Math.PI / 4 + Math.sin(t * 0.015) * 0.15; // oscillating angle
          const laserSourceX = w / 2 - Math.tan(incAngle) * (h / 2 - 30);
          const laserSourceY = 30;

          ctx.strokeStyle = "#ef4444"; // red laser ray
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(laserSourceX, laserSourceY);
          ctx.lineTo(w / 2, h / 2);
          ctx.stroke();

          // Refracted light ray (smaller angle inside glass)
          const refractAngle = Math.asin(Math.sin(incAngle) / 1.5); // Snell's Law n=1.5
          const endX = w / 2 + Math.tan(refractAngle) * (h / 2 - 30);
          const endY = h - 35;

          ctx.strokeStyle = "rgba(239, 68, 68, 0.7)";
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(w / 2, h / 2);
          ctx.lineTo(endX, endY);
          ctx.stroke();

          // Media captions
          ctx.fillStyle = "#94a3b8";
          ctx.font = "bold 9px monospace";
          ctx.fillText("Aire (n₁ = 1.0)", w - 140, 45);
          ctx.fillText("Vidrio (n₂ = 1.5)", w - 140, h / 2 + 30);
          ctx.fillText("Sen(θ₁) / Sen(θ₂) = n₂ / n₁", 45, 45);

          ctx.restore();
        } else {
          // --- GENERAL ELECTROMAGNETIC OR BITING VECTOR ORBITS ---
          ctx.save();
          
          // Nucleus/Magnet central charges
          ctx.fillStyle = "#ef4444"; // positive
          ctx.beginPath();
          ctx.arc(w / 2 - 15, h / 2, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = "#0ea5e9"; // negative
          ctx.beginPath();
          ctx.arc(w / 2 + 15, h / 2, 10, 0, Math.PI * 2);
          ctx.fill();

          // Spinning electrostatic orbit field lines
          ctx.strokeStyle = "rgba(59, 130, 246, 0.45)";
          ctx.lineWidth = 1.5;
          const orbitRadiusX = 80;
          const orbitRadiusY = 40;
          const orbitSpeed = t * 0.04;

          ctx.beginPath();
          ctx.ellipse(w / 2, h / 2, orbitRadiusX, orbitRadiusY, Math.PI / 6, 0, Math.PI * 2);
          ctx.stroke();

          // Orbiting electron particles
          const electricX = w / 2 + Math.cos(orbitSpeed) * orbitRadiusX;
          const electricY = h / 2 + Math.sin(orbitSpeed) * orbitRadiusY;
          ctx.fillStyle = "#10b981"; // electron green glow
          ctx.beginPath();
          ctx.arc(electricX, electricY, 6, 0, Math.PI * 2);
          ctx.fill();

          // Magnetic vector tags
          ctx.fillStyle = "#10b981";
          ctx.font = "bold 9px monospace";
          ctx.fillText("q", electricX + 10, electricY + 5);
          ctx.fillText("Fuerza Magnética ( Lorentz )", 40, h - 30);

          ctx.restore();
        }
      }

      // --- 🧠 ADVANCED INTERACTIVE AI VISUAL EFFECTS & FILTERS ---
      if (aiFilter !== "none") {
        ctx.save();
        
        if (aiFilter === "hologram") {
          // 1. Hologram Laser Horizontal Sweep
          const scanY = (t * 1.5) % h;
          const gradient = ctx.createLinearGradient(0, scanY - 12, 0, scanY + 4);
          gradient.addColorStop(0, "rgba(59, 130, 246, 0.0)");
          gradient.addColorStop(0.5, "rgba(59, 130, 246, 0.22)");
          gradient.addColorStop(1, "rgba(59, 130, 246, 0.0)");
          ctx.fillStyle = gradient;
          ctx.fillRect(0, scanY - 12, w, 16);
          
          // Scanning crisp laser line
          ctx.strokeStyle = "rgba(147, 197, 253, 0.6)";
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(10, scanY);
          ctx.lineTo(w - 10, scanY);
          ctx.stroke();

          // Horizontal scan grid/vignette
          ctx.strokeStyle = "rgba(59, 130, 246, 0.03)";
          ctx.lineWidth = 1;
          for (let y = 15; y < h - 15; y += 4) {
            ctx.beginPath();
            ctx.moveTo(15, y);
            ctx.lineTo(w - 15, y);
            ctx.stroke();
          }

          // Cyber HUD Telemetry data on corners
          ctx.fillStyle = "rgba(59, 130, 246, 0.7)";
          ctx.font = "bold 8px monospace";
          ctx.textAlign = "left";
          ctx.fillText(`[AI DIAGRAM RECONSTRUCTION]`, 25, 38);
          ctx.fillText(`STABILITY: 99.4%`, 25, 48);
          ctx.fillText(`MODEL: GEMINI-3.5`, 25, 58);

          ctx.textAlign = "right";
          ctx.fillText(`SCAN RATE: 240Hz`, w - 25, 38);
          ctx.fillText(`FPS: 60.0`, w - 25, 48);
          ctx.fillText(`RENDER: QUANTUM HOLOGRAPHIC`, w - 25, 58);

        } else if (aiFilter === "quantum") {
          // 2. Quantum Particle Swarm Animation
          ctx.fillStyle = "rgba(34, 197, 94, 0.6)"; // Emerald glowing quantum particles
          const pCount = 15;
          for (let i = 0; i < pCount; i++) {
            // Orbiting math around center
            const radX = 140 + Math.sin(t * 0.01 + i) * 35;
            const radY = 100 + Math.cos(t * 0.015 + i * 2) * 20;
            const px = w / 2 + Math.sin(t * 0.02 + i * 4) * radX;
            const py = h / 2 + Math.cos(t * 0.018 + i * 3) * radY;

            ctx.beginPath();
            ctx.arc(px, py, 2.5, 0, Math.PI * 2);
            ctx.fill();

            // Tiny orbit traces
            ctx.strokeStyle = "rgba(34, 197, 94, 0.05)";
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.arc(w / 2, h / 2, Math.sqrt(radX*radX + radY*radY), 0, Math.PI * 2);
            ctx.stroke();
          }

          // Quantum HUD Telemetry
          ctx.fillStyle = "rgba(16, 185, 129, 0.7)";
          ctx.font = "bold 8px monospace";
          ctx.textAlign = "left";
          ctx.fillText(`[AI QUANTUM PARTICLE RENDERER]`, 25, 38);
          ctx.fillText(`ORBIT_VEL: COSINE_STABLE`, 25, 48);
          ctx.fillText(`HADRONS: FLUID_SIM`, 25, 58);

          ctx.textAlign = "right";
          ctx.fillText(`SWARM_COUNT: ${pCount}`, w - 25, 38);
          ctx.fillText(`P_SPIN: HIGH_ALPHA`, w - 25, 48);
          ctx.fillText(`FIELD_MATRIX: ACTIVE`, w - 25, 58);

        } else if (aiFilter === "blueprint") {
          // 3. Technical Blueprint Engineering Grid Overlays
          ctx.strokeStyle = "rgba(6, 182, 212, 0.12)";
          ctx.lineWidth = 1;
          
          // Blueprint drafting lines
          ctx.beginPath();
          ctx.arc(35, 35, 20, 0, Math.PI * 2);
          ctx.arc(w - 35, 35, 20, 0, Math.PI * 2);
          ctx.arc(35, h - 35, 20, 0, Math.PI * 2);
          ctx.arc(w - 35, h - 35, 20, 0, Math.PI * 2);
          ctx.stroke();

          // Compass Crosshairs in the center of corners
          const cross = 8;
          const centers = [[35, 35], [w - 35, 35], [35, h - 35], [w - 35, h - 35]];
          ctx.strokeStyle = "rgba(6, 182, 212, 0.35)";
          centers.forEach(([cx, cy]) => {
            ctx.beginPath(); ctx.moveTo(cx - cross, cy); ctx.lineTo(cx + cross, cy); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(cx, cy - cross); ctx.lineTo(cx, cy + cross); ctx.stroke();
          });

          // Cyber Tech Telemetry
          ctx.fillStyle = "rgba(6, 182, 212, 0.7)";
          ctx.font = "bold 8px monospace";
          ctx.textAlign = "left";
          ctx.fillText(`[AI BLUEPRINT PLAN ENGINE]`, 25, 38);
          ctx.fillText(`SCALE: 1:1.35_METRIC`, 25, 48);
          ctx.fillText(`COORDS: ISO_CARTESIAN`, 25, 58);

          ctx.textAlign = "right";
          ctx.fillText(`PATENT_NO: PHYS-993-AI`, w - 25, 38);
          ctx.fillText(`TOLERANCE: +/- 0.005`, w - 25, 48);
          ctx.fillText(`DRAFTING: CAD_VECTOR`, w - 25, 58);
        }
        
        ctx.restore();
      }

      // --- 🔊 SPEAKING AUDIO WAVE VISUALIZER BAR LAYOVER ---
      if (isPlaying) {
        ctx.strokeStyle = pulseColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        const baseLineY = 22;
        const waveSegments = 30;
        const step = w / waveSegments;
        for (let i = 0; i <= waveSegments; i++) {
          const waveX = i * step;
          const waveY = baseLineY + Math.sin(i * 0.6 + t * 0.18) * (5 + Math.random() * 8);
          if (i === 0) ctx.moveTo(waveX, waveY);
          else ctx.lineTo(waveX, waveY);
        }
        ctx.stroke();

        // Increment writing continuous timer logic
        timeRef.current += 1;
      } else {
        // Flat line visualizer in standby
        ctx.strokeStyle = "rgba(148, 163, 184, 0.3)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(20, 22);
        ctx.lineTo(w - 20, 22);
        ctx.stroke();
      }

      animationFrameId.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isPlaying, category, title, explanation, studioMode, chapters, currentStep, aiFilter]);

  // Export video demo
  const triggerExport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      setExported(true);
    }, 4500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-[#02050c]/90 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0b1329] border border-blue-500/20 w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-auto md:h-[620px]">
        {isLoadingScript ? (
          <div className="w-full flex flex-col items-center justify-center p-12 text-center space-y-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
              <Sparkles className="w-6 h-6 text-blue-400 absolute inset-0 m-auto animate-pulse" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white tracking-tight font-sans">Generando Guión del Video Explicativo...</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed font-sans">
                Physix AI está deconstruyendo mecánicamente tu problema y tejiendo un guión explicativo interactivo de 5 capítulos con el <strong>porqué</strong> de cada paso práctico y fórmula en español.
              </p>
            </div>
            <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden relative">
              <div className="absolute inset-y-0 left-0 bg-blue-500 rounded-full animate-[progress_1.8s_ease-in-out_infinite] w-2/3" />
            </div>
            {/* Close button so users aren't locked out if they close and it's taking too long */}
            <button
              onClick={onClose}
              className="text-white hover:text-red-400 text-xs font-mono border border-white/10 hover:border-red-500/30 px-3 py-1.5 rounded bg-white/5 transition-all"
            >
              Cancelar generación
            </button>
            <style>{`
              @keyframes progress {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(150%); }
              }
            `}</style>
          </div>
        ) : (
          <>
            {/* LEFT PANEL: Interactive Screen & Canvas Simulator */}
            <div className="flex-1 bg-[#060b17] flex flex-col justify-between p-4 relative border-r border-white/5">
          {/* Studio Top Badge & Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-black tracking-widest text-slate-300 font-mono uppercase">
                STUDIO VIRTUAL DE FÍSICA
              </span>
            </div>
            
            {/* Mode Switcher Tabs */}
            <div className="flex space-x-1 bg-slate-950 p-0.5 rounded-lg border border-white/10 self-end sm:self-auto">
              <button
                onClick={() => setStudioMode("blackboard")}
                className={`px-2.5 py-1 text-[10px] font-black uppercase rounded transition-all ${
                  studioMode === "blackboard"
                    ? "bg-blue-600 text-white shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Pizarra Virtual con la resolución matemática detallada"
              >
                📝 Pizarra
              </button>
              <button
                onClick={() => setStudioMode("diagram")}
                className={`px-2.5 py-1 text-[10px] font-black uppercase rounded transition-all ${
                  studioMode === "diagram"
                    ? "bg-blue-600 text-white shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Simulaciones Gráficas de Física Interactiva"
              >
                🔬 Simulador
              </button>
            </div>
          </div>

          {/* Active Chapter Header Bar */}
          <div className="mb-2 bg-[#0a1122]/90 border border-blue-500/15 px-3.5 py-2 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="relative w-2.5 h-2.5 flex items-center justify-center flex-shrink-0">
                <div className={`absolute w-2.5 h-2.5 rounded-full bg-emerald-400 ${isPlaying && !isMuted ? "animate-ping" : ""}`} />
                <div className="relative w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </div>
              <h2 className="text-xs font-bold text-slate-300 truncate">
                Presentando: <span className="text-blue-400">{title}</span>
              </h2>
            </div>
            
            <div className="flex items-center space-x-2 flex-shrink-0">
              <div className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase font-mono">
                {chapters[currentStep]?.title || "Capítulo"}
              </div>
              <div className="px-2 py-0.5 rounded bg-slate-900 border border-white/5 text-[9px] font-bold text-slate-400 font-mono">
                {isPlaying ? (isMuted ? "MUTED" : "REPRODUCIENDO") : "PAUSADO"}
              </div>
            </div>
          </div>

          {/* SIMULATION VISUALIZER STAGE */}
          <div className="flex-1 bg-[#03060d]/80 rounded-xl border border-white/5 relative overflow-hidden flex items-center justify-center min-h-[220px]">
            {/* The canvas */}
            <canvas 
              ref={canvasRef} 
              width={720} 
              height={450} 
              className="w-full h-full block z-10"
            />

            {/* AI Image / Schematic Visual Feed Overlay */}
            {visualFeed !== "interactive" && (
              <div className="absolute inset-0 z-20 flex flex-col justify-between overflow-hidden group select-none animate-fade-in bg-[#03060d]">
                {/* Real-world/Schematic physics image */}
                <div className="absolute inset-0 w-full h-full">
                  <img
                    src={visualFeed === "ai_schematic" ? assets.schematic : assets.realWorld}
                    alt={assets.categoryName}
                    className="w-full h-full object-cover opacity-60 mix-blend-lighten transition-transform duration-700 group-hover:scale-105"
                    referrerPolicy="no-referrer"
                  />
                  {/* Glowing cyber grid overlay pattern on top of image */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40" />
                </div>

                {/* AI Overlay elements */}
                <div className="relative p-4 flex justify-between items-start z-30">
                  <div className="bg-blue-600/20 border border-blue-500/30 px-2.5 py-1 rounded-lg backdrop-blur-md">
                    <p className="text-[9px] font-black uppercase text-blue-400 font-mono tracking-widest flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5 animate-pulse" />
                      {visualFeed === "ai_schematic" ? "Esquema Analítico IA" : "Aplicación Física Real"}
                    </p>
                  </div>
                  
                  <div className="bg-slate-900/80 border border-white/5 px-2 py-0.5 rounded font-mono text-[8px] text-slate-400">
                    RESOLUCIÓN: 1080P_REF
                  </div>
                </div>

                {/* Pulsing focal point markers or scanline indicator */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                  <div className="w-12 h-12 rounded-full border-2 border-dashed border-blue-400/20 animate-spin flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full border border-blue-400/40 animate-pulse" />
                  </div>
                </div>

                {/* Bottom caption card */}
                <div className="relative p-4 bg-gradient-to-t from-slate-950 via-slate-950/90 to-transparent z-30">
                  <p className="text-xs font-bold text-slate-200">
                    {assets.categoryName}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                    {assets.description}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* TELEPROMPTER / SUBTITLES SCREEN */}
          <div className="mt-3 bg-[#0a1122] rounded-xl p-3 border border-blue-500/10 min-h-[90px] max-h-[120px] overflow-y-auto flex items-center justify-center">
            <p className="text-slate-200 text-center text-xs md:text-sm font-medium leading-relaxed max-w-xl select-none font-sans">
              "{chapters[currentStep]?.text || "Inicia el video para escuchar al tutor explicando el problema físico de manera interactiva paso a paso sin cabos sueltos."}"
            </p>
          </div>

          {/* LOWER CONTROLS PANEL */}
          <div className="mt-3 flex items-center justify-between gap-3 pt-3 border-t border-white/5">
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePlayPause}
                className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 font-bold text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform"
                title={isPlaying ? "Pausar Video" : "Iniciar Video"}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>

              <button
                onClick={() => {
                  if (window.speechSynthesis) window.speechSynthesis.cancel();
                  setCurrentStep(0);
                  setIsPlaying(false);
                }}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center active:scale-95 transition-transform"
                title="Reiniciar Video"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={toggleMute}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isMuted ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
                title={isMuted ? "Activar Sonido" : "Silenciar"}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            {/* Custom scrubber progress mini-dots */}
            <div className="flex items-center space-x-1.5 bg-[#0e172a] px-2.5 py-1.5 rounded-full border border-white/5 text-[10px] font-mono text-slate-400">
              {chapters.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => changeStep(idx)}
                  className={`w-4 h-4 rounded-full flex items-center justify-center transition-all ${
                    idx === currentStep 
                      ? "bg-blue-500 text-white font-black scale-110" 
                      : idx < currentStep 
                        ? "bg-slate-800 text-slate-400 hover:bg-slate-700" 
                        : "bg-slate-900 border border-white/10 hover:border-white/20 text-slate-500"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            {/* Close trigger */}
            <button
              onClick={() => {
                if (window.speechSynthesis) window.speechSynthesis.cancel();
                onClose();
              }}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all duration-200"
            >
              Cerrar
            </button>
          </div>
        </div>

        {/* RIGHT PANEL: Customizable voice settings & Script outline */}
        <div className="w-full md:w-80 bg-[#0e1830] p-4 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <span className="text-xs font-extrabold text-blue-400 font-mono uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> AJUSTES DE VOZ IA
              </span>
              <button 
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Voice Narrator Mode */}
            <div className="space-y-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono">Tono del Narrador:</span>
              <div className="grid grid-cols-3 gap-1">
                {(["female", "male", "robot"] as const).map(nMode => (
                  <button
                    key={nMode}
                    onClick={() => setVoiceGender(nMode)}
                    className={`py-1.5 text-xs font-black rounded-lg uppercase transition-all ${
                      voiceGender === nMode 
                        ? "bg-blue-500 text-white shadow-md border border-blue-400/30" 
                        : "bg-[#070b16] text-slate-400 hover:text-slate-300 border border-white/5"
                    }`}
                  >
                    {nMode === "female" ? "Pamela" : nMode === "male" ? "Carlos" : "FisicBot"}
                  </button>
                ))}
              </div>
            </div>

            {/* Visual Feed Source Selection */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1">
                <Image className="w-3 h-3 text-blue-400" /> Origen de la Pantalla:
              </span>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => setVisualFeed("interactive")}
                  className={`px-3 py-2 text-left text-xs rounded-xl transition-all border flex items-center justify-between ${
                    visualFeed === "interactive"
                      ? "bg-blue-600/10 text-white border-blue-500/40 font-bold shadow-lg"
                      : "bg-[#070b16] text-slate-400 hover:text-slate-300 border-white/5"
                  }`}
                  title="Simulador interactivo programado con fórmulas"
                >
                  <span className="flex items-center gap-1.5">
                    <span>📐</span> Simulador Interactivo 2D
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 uppercase font-bold font-mono">
                    FÓRMULAS
                  </span>
                </button>

                <button
                  onClick={() => setVisualFeed("ai_schematic")}
                  className={`px-3 py-2 text-left text-xs rounded-xl transition-all border flex items-center justify-between ${
                    visualFeed === "ai_schematic"
                      ? "bg-blue-600/10 text-white border-blue-500/40 font-bold shadow-lg"
                      : "bg-[#070b16] text-slate-400 hover:text-slate-300 border-white/5"
                  }`}
                  title="Esquema analítico vectorial diseñado por IA"
                >
                  <span className="flex items-center gap-1.5">
                    <span>🤖</span> Ilustración / Esquema IA
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 uppercase font-bold font-mono">
                    BLUEPRINT
                  </span>
                </button>

                <button
                  onClick={() => setVisualFeed("real_world")}
                  className={`px-3 py-2 text-left text-xs rounded-xl transition-all border flex items-center justify-between ${
                    visualFeed === "real_world"
                      ? "bg-blue-600/10 text-white border-blue-500/40 font-bold shadow-lg"
                      : "bg-[#070b16] text-slate-400 hover:text-slate-300 border-white/5"
                  }`}
                  title="Fotografía real representativa del fenómeno físico"
                >
                  <span className="flex items-center gap-1.5">
                    <span>🖼️</span> Aplicación Física Real
                  </span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 uppercase font-bold font-mono">
                    FOTO REAL
                  </span>
                </button>
              </div>
            </div>

            {/* AI Render / Visual Filters */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-blue-400 animate-pulse" /> Animación e Imagen IA:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                {(["none", "hologram", "quantum", "blueprint"] as const).map(filter => (
                  <button
                    key={filter}
                    onClick={() => setAiFilter(filter)}
                    className={`py-1.5 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center space-x-1 border ${
                      aiFilter === filter 
                        ? "bg-blue-600 text-white border-blue-400/40 shadow-inner" 
                        : "bg-[#070b16] text-slate-400 hover:text-slate-300 border-white/5"
                    }`}
                    title={`Filtro de IA: ${filter}`}
                  >
                    <span>
                      {filter === "none" ? "📐 Físico" : filter === "hologram" ? "🤖 Holograma" : filter === "quantum" ? "⚛️ Cuántico" : "🔧 Técnico"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Speed speech options */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono flex items-center gap-1">
                  <Gauge className="w-3 h-3 text-blue-400" /> Velocidad de Voz:
                </span>
                <span className="text-xs font-bold text-blue-300 font-mono">{speechRate}x</span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {[0.75, 1, 1.25, 1.5].map(rate => (
                  <button
                    key={rate}
                    onClick={() => setSpeechRate(rate)}
                    className={`py-1 text-xs font-bold rounded-lg transition-all ${
                      speechRate === rate 
                        ? "bg-slate-700 text-white font-extrabold" 
                        : "bg-[#070b16] text-slate-400 hover:text-slate-300"
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>

            {/* Chapters Timeline List Info */}
            <div className="space-y-2 pt-2 border-t border-white/5">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono">
                Índice de Capítulos (Clic para saltar):
              </span>
              <div className="space-y-1.5 max-h-[180px] overflow-y-auto pr-1">
                {chapters.map((chap, idx) => (
                  <button
                    key={chap.id}
                    onClick={() => changeStep(idx)}
                    className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                      idx === currentStep 
                        ? "bg-blue-500/10 border border-blue-500/20 text-white" 
                        : "bg-[#070b16]/50 hover:bg-[#070b16] text-slate-300"
                    }`}
                  >
                    <div className="font-medium truncate pr-2">
                      {chap.title}
                    </div>
                    {idx === currentStep && <ChevronRight className="w-3 h-3 text-blue-400 flex-shrink-0 animate-pulse" />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Export Video Box */}
          <div className="pt-4 border-t border-white/5 space-y-2">
            <div className="bg-slate-900/60 rounded-xl p-3 border border-white/5">
              <div className="flex items-center space-x-1.5 text-xs text-yellow-400 font-bold mb-1">
                <Tv className="w-3.5 h-3.5" />
                <span>Modo de Estudio Activo</span>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                El video interactivo asiste tu memoria visual y auditiva. Ideal para repasar fórmulas y resolver dudas de examen.
              </p>
            </div>

            <button
              onClick={triggerExport}
              disabled={exporting}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center space-x-2 transition-all ${
                exported 
                  ? "bg-emerald-500 hover:bg-emerald-600 text-white" 
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              {exporting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Procesando video MP4...</span>
                </>
              ) : exported ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Video Descargado!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Exportar Video MP4</span>
                </>
              )}
            </button>
          </div>

        </div>
        </>
        )}
      </div>
    </div>
  );
}
