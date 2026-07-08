import React, { useState } from "react";
import { Copy, Bookmark, Check, ThumbsUp, ThumbsDown } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface FormulaBlockProps {
  text: string;
  onSaveToLab?: (formula: string, name?: string) => void;
}

export function cleanPhysicsFormula(equation: string): string {
  if (!equation) return "";
  let clean = equation.trim();

  // Strip markdown code block fences (e.g., ```python) and backticks
  clean = clean.replace(/```[a-zA-Z0-9]*\n?/gi, '');
  clean = clean.replace(/`/g, '');

  // Strip line-level programming comments (e.g., # or //)
  clean = clean.replace(/^\s*#.*$/gm, '');
  clean = clean.replace(/^\s*\/\/.*$/gm, '');

  // Strip programming keywords or print statements that leak
  clean = clean.replace(/^\s*(def|function|return|const|let|var|print|console\.log)\b.*$/gim, '');

  // Clean up any double or extra newlines that resulted from stripping
  clean = clean.split('\n').filter(line => line.trim().length > 0).join('\n').trim();

  // Strip math dollar symbols and brackets
  clean = clean.replace(/^\$\$?|^\$|\$\$?$|\$$/g, '');
  clean = clean.replace(/^\\\[|^\\\]|\\\]$/g, '');

  // Strip LaTeX styling tags
  clean = clean.replace(/\\text\s*\{([^}]+)\}/g, '$1');
  clean = clean.replace(/\\mathrm\s*\{([^}]+)\}/g, '$1');
  clean = clean.replace(/\\mathbf\s*\{([^}]+)\}/g, '$1');

  // Convert operations / spacing
  clean = clean.replace(/\\implies/g, '  ⇒  ');
  clean = clean.replace(/\\rightarrow/g, ' ➔ ');
  clean = clean.replace(/\\leftrightarrow/g, ' ↔ ');
  clean = clean.replace(/\\cdot/g, ' · ');
  clean = clean.replace(/\\times/g, ' × ');
  clean = clean.replace(/\\approx/g, ' ≈ ');
  clean = clean.replace(/\\neq/g, ' ≠ ');
  clean = clean.replace(/\\le/g, ' ≤ ');
  clean = clean.replace(/\\ge/g, ' ≥ ');
  clean = clean.replace(/\\infty/g, '∞');

  // Convert Greek letters
  clean = clean.replace(/\\Delta/g, 'Δ');
  clean = clean.replace(/\\delta/g, 'δ');
  clean = clean.replace(/\\theta/g, 'θ');
  clean = clean.replace(/\\alpha/g, 'α');
  clean = clean.replace(/\\beta/g, 'β');
  clean = clean.replace(/\\gamma/g, 'γ');
  clean = clean.replace(/\\lambda/g, 'λ');
  clean = clean.replace(/\\omega/g, 'ω');
  clean = clean.replace(/\\mu/g, 'μ');
  clean = clean.replace(/\\phi/g, 'φ');
  clean = clean.replace(/\\psi/g, 'ψ');
  clean = clean.replace(/\\pi/g, 'π');
  clean = clean.replace(/\\rho/g, 'ρ');
  clean = clean.replace(/\\tau/g, 'τ');
  clean = clean.replace(/\\sigma/g, 'σ');
  clean = clean.replace(/\\epsilon/g, 'ε');
  clean = clean.replace(/\\eta/g, 'η');

  // Convert Fractions recursively so nested fractions work!
  let lastState = "";
  while (clean !== lastState) {
    lastState = clean;
    clean = clean.replace(/\\frac\s*\{([^{}]+)\}\s*\{([^{}]+)\}/g, '($1) / ($2)');
  }
  
  // Clean up superfluous brackets for plain variables in fractions i.e. (v_f) / (t) -> v_f / t
  clean = clean.replace(/\(([^()+\-*/]+)\)\s*\/\s*\(([^()+\-*/]+)\)/g, '$1 / $2');

  // Convert Square Roots
  clean = clean.replace(/\\sqrt\s*\{([^{}]+)\}/g, '√($1)');

  // Convert Subscripts {abc} or _abc
  clean = clean.replace(/_\{([a-zA-Z0-9+_*-]+)\}/g, (_, sub) => {
    return sub.split('').map((char: string) => {
      const subs: Record<string, string> = {
        '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
        'a': 'ₐ', 'e': 'ₑ', 'h': 'ₕ', 'i': 'ᵢ', 'j': 'ⱼ', 'k': 'ₖ', 'l': 'ₗ', 'm': 'ₘ', 'n': 'ₙ', 'o': 'ₒ',
        'p': 'ₚ', 'r': 'ᵣ', 's': 'ₛ', 't': 'ₜ', 'u': 'ᵤ', 'v': 'ᵥ', 'x': 'ₓ', 'y': 'ᵧ',
        'f': '𝒻', 'A': 'ₐ', 'B': '♭', 'C': '꜀'
      };
      return subs[char] || char;
    }).join('');
  });

  clean = clean.replace(/_([a-zA-Z0-9])/g, (_, char) => {
    const subs: Record<string, string> = {
      '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
      'a': 'ₐ', 'e': 'ₑ', 'h': 'ₕ', 'i': 'ᵢ', 'j': 'ⱼ', 'k': 'ₖ', 'l': 'ₗ', 'm': 'ₘ', 'n': 'ₙ', 'o': 'ₒ',
      'p': 'ₚ', 'r': 'ᵣ', 's': 'ₛ', 't': 'ₜ', 'u': 'ᵤ', 'v': 'ᵥ', 'x': 'ₓ', 'y': 'ᵧ', 'f': '𝒻'
    };
    return subs[char] || `_${char}`;
  });

  // Convert Superscripts {abc} or ^abc
  clean = clean.replace(/\^\{([a-zA-Z0-9+_*-]+)\}/g, (_, sup) => {
    return sup.split('').map((char: string) => {
      const sups: Record<string, string> = {
        '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
        '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾',
        'a': 'ª', 'b': 'ᵇ', 'c': 'ᶜ', 'd': 'ᵈ', 'e': 'ᵉ', 'f': 'ᶠ', 'g': 'ᵍ', 'h': 'ʰ', 'i': 'ⁱ', 'j': 'ʲ',
        'k': 'ᵏ', 'l': 'ˡ', 'm': 'ᵐ', 'n': 'ⁿ', 'o': 'ᵒ', 'p': 'ᵖ', 'r': 'ʳ', 's': 'ˢ', 't': 'ᵗ', 'u': 'ᵘ',
        'v': 'ᵛ', 'w': 'ʷ', 'x': 'ˣ', 'y': 'ʸ', 'z': 'ᶻ'
      };
      return sups[char] || char;
    }).join('');
  });

  clean = clean.replace(/\^([0-9a-zA-Z])/g, (_, char) => {
    const sups: Record<string, string> = {
      '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
      'a': 'ª', 'b': 'ᵇ', 'c': 'ᶜ', 'd': 'ᵈ', 'e': 'ᵉ', 'f': 'ᶠ', 'g': 'ᵍ', 'h': 'ʰ', 'i': 'ⁱ', 'j': 'ʲ',
      'k': 'ᵏ', 'l': 'ˡ', 'm': 'ᵐ', 'n': 'ⁿ', 'o': 'ᵒ', 'p': 'ᵖ', 'r': 'ʳ', 's': 'ˢ', 't': 'ᵗ', 'u': 'ᵘ',
      'v': 'ᵛ', 'w': 'ʷ', 'x': 'ˣ', 'y': 'ʸ', 'z': 'ᶻ'
    };
    return sups[char] || `^${char}`;
  });

  // Remove any remaining raw backslashes
  clean = clean.replace(/\\/g, '');

  return clean;
}

export function cleanGeneralText(raw: string): string {
  if (!raw) return "";
  let clean = raw;
  // Replace inline LaTeX math blocks like $m = 80\text{ kg}$
  clean = clean.replace(/\$([^$]+)\$/g, (_, inner) => {
    return cleanPhysicsFormula(inner);
  });
  return clean;
}

export default function FormulaBlock({ text, onSaveToLab }: FormulaBlockProps) {
  const [copiedFormula, setCopiedFormula] = useState<string | null>(null);
  const [savedFormula, setSavedFormula] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<"like" | "dislike" | null>(null);

  const handleCopy = (formulaText: string) => {
    navigator.clipboard.writeText(formulaText);
    setCopiedFormula(formulaText);
    setTimeout(() => setCopiedFormula(null), 2000);
  };

  const handleSave = (formulaText: string) => {
    if (onSaveToLab) {
      onSaveToLab(formulaText);
    }
    setSavedFormula(formulaText);
    setTimeout(() => setSavedFormula(null), 2000);
  };

  const mdComponents = {
    p: ({ children }: any) => (
      <p className="mb-5 last:mb-0 leading-relaxed text-[#cbd5e1] font-normal">
        {children}
      </p>
    ),
    strong: ({ children }: any) => (
      <strong className="font-extrabold text-[#22d3ee] bg-[#0c4a6e]/30 px-1.5 py-0.5 rounded border border-[#0891b2]/30 shadow-sm inline-block md:inline my-[1px]">
        {children}
      </strong>
    ),
    ul: ({ children }: any) => (
      <ul className="list-disc pl-5 space-y-3 mb-5 text-[#cbd5e1]">
        {children}
      </ul>
    ),
    ol: ({ children }: any) => (
      <ol className="list-decimal pl-5 space-y-3 mb-5 text-[#cbd5e1]">
        {children}
      </ol>
    ),
    li: ({ children }: any) => (
      <li className="leading-relaxed">
        {children}
      </li>
    ),
    h1: ({ children }: any) => (
      <h1 className="text-xl font-bold font-display text-white mt-6 mb-3">
        {children}
      </h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-lg font-bold font-display text-white mt-5 mb-2.5">
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-base font-bold font-display text-white mt-4.5 mb-2">
        {children}
      </h3>
    ),
  };

  // Regular expression to find [FORMULA] ... [/FORMULA] blocks
  const formulaRegex = /\[FORMULA\]([\s\S]*?)\[\/FORMULA\]/g;

  // Split text into normal segments and formula blocks
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = formulaRegex.exec(text)) !== null) {
    const matchIndex = match.index;
    const fullMatch = match[0];
    const formulaContent = match[1];

    // Add preceding normal text (clean inline LaTeX dollars too!)
    if (matchIndex > lastIndex) {
      const normalText = text.substring(lastIndex, matchIndex);
      elements.push(
        <div key={`text-${lastIndex}`} className="prose prose-invert max-w-none text-slate-300 leading-relaxed text-[15px]">
          <ReactMarkdown components={mdComponents}>{cleanGeneralText(normalText)}</ReactMarkdown>
        </div>
      );
    }

    // Parse the inner content of formula: [FORMULA] equation --- variables [/FORMULA]
    const parts = formulaContent.split("---");
    const equationStr = parts[0]?.trim() || "";
    const variablesStr = parts[1]?.trim() || "";
    const variables = variablesStr
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const pristineEquation = cleanPhysicsFormula(equationStr);

    elements.push(
      <div
        key={`formula-block-${matchIndex}`}
        className="my-5 bg-[#0e1726]/90 border border-blue-500/15 rounded-2xl p-5 shadow-2xl relative overflow-hidden"
      >
        {/* Subtle accent glow */}
        <div className="absolute -right-16 -top-16 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Big centered formula equation */}
        <div className="flex flex-col items-center justify-center py-6 px-4 bg-[#0a1120]/60 rounded-xl border border-white/5 mb-4 font-sans select-all select-none">
          <div className="text-2xl md:text-3xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-white to-blue-300 text-center select-text">
            {pristineEquation}
          </div>
        </div>

        {/* Divider and Variables */}
        {variables.length > 0 && (
          <div className="border-t border-white/5 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 ">
              {variables.map((v, i) => {
                const eqIdx = v.indexOf("=");
                if (eqIdx !== -1) {
                  const left = v.substring(0, eqIdx).trim();
                  const right = v.substring(eqIdx + 1).trim();
                  return (
                    <div key={i} className="flex items-baseline space-x-2 text-sm">
                      <span className="font-bold text-blue-400 min-w-[20px]">{cleanPhysicsFormula(left)}</span>
                      <span className="text-slate-450">=</span>
                      <span className="text-slate-300">{cleanGeneralText(right)}</span>
                    </div>
                  );
                }
                return (
                  <div key={i} className="text-sm text-slate-300">
                    {cleanGeneralText(v)}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons inside feedback block */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-6 pt-4 border-t border-white/5">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleCopy(pristineEquation)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#1d273a] hover:bg-slate-700 active:scale-95 text-xs font-medium text-slate-200 border border-white/5 transition-all"
            >
              {copiedFormula === pristineEquation ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar fórmula</span>
                </>
              )}
            </button>

            <button
              onClick={() => handleSave(pristineEquation)}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-[#1d273a] hover:bg-slate-700 active:scale-95 text-xs font-medium text-slate-200 border border-white/5 transition-all"
            >
              {savedFormula === pristineEquation ? (
                <>
                  <Check className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-blue-400 font-semibold">¡Guardado!</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Guardar en Lab</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center space-x-2 text-slate-400">
            <button
              onClick={() => setFeedback(feedback === "like" ? null : "like")}
              className={`p-1.5 rounded-lg hover:bg-white/5 transition-colors ${
                feedback === "like" ? "text-blue-400 scale-110" : ""
              }`}
              aria-label="Like response"
            >
              <ThumbsUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => setFeedback(feedback === "dislike" ? null : "dislike")}
              className={`p-1.5 rounded-lg hover:bg-white/5 transition-colors ${
                feedback === "dislike" ? "text-rose-400 scale-110" : ""
              }`}
              aria-label="Dislike response"
            >
              <ThumbsDown className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );

    lastIndex = formulaRegex.lastIndex;
  }

  // Add remaining trailing text
  if (lastIndex < text.length) {
    const normalText = text.substring(lastIndex);
    elements.push(
      <div key={`text-${lastIndex}`} className="prose prose-invert max-w-none text-slate-300 leading-relaxed text-[15px]">
        <ReactMarkdown components={mdComponents}>{cleanGeneralText(normalText)}</ReactMarkdown>
      </div>
    );
  }

  return <div className="space-y-4">{elements}</div>;
}
