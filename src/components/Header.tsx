import React from "react";

interface HeaderProps {
  onAvatarClick?: () => void;
  title?: string;
  hasShutterLogo?: boolean;
  onHomeClick?: () => void;
}

export default function Header({ onAvatarClick, title = "Physix AI", hasShutterLogo = false, onHomeClick }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-[#070d19]/80 backdrop-blur sticky top-0 z-50">
      <div 
        onClick={onHomeClick}
        className={`flex items-center space-x-2.5 ${onHomeClick ? "cursor-pointer hover:opacity-80 active:scale-95 transition-all" : ""}`}
        title={onHomeClick ? "Volver al Inicio" : undefined}
      >
        {hasShutterLogo ? (
          // Shutter or compass-like camera logo
          <div className="w-8 h-8 rounded-full border-2 border-blue-500/40 flex items-center justify-center bg-blue-950/20 text-blue-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              <path d="M2 12h20" />
            </svg>
          </div>
        ) : (
          // Physic flask / alien logo from screenshot
          <div className="w-8 h-8 flex items-center justify-center text-blue-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Lab Flask shaped beaker from Screenshot */}
              <path d="M6 3h12" />
              <path d="M18 3v3c0 .8-.4 1.5-1 2L9 16c-.6.5-1 1.2-1 2v3h8v-3c0-.8-.4-1.5-1-2l-.5-.5" />
              <path d="M3 21h18" />
            </svg>
          </div>
        )}
        <h1 className="text-xl font-bold font-display tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-blue-300">
          {title}
        </h1>
      </div>

      <button
        onClick={onAvatarClick}
        className="relative group transition-transform active:scale-95"
        aria-label="User profile"
      >
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full blur opacity-40 group-hover:opacity-100 transition duration-300" />
        <div className="relative w-9 h-9 rounded-full overflow-hidden border border-white/20 bg-slate-800">
          <img
            src="https://images.unsplash.com/photo-1628157582853-a796fa650a6a?q=80&w=200&auto=format&fit=crop"
            alt="Cyberpunk student avatar"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
      </button>
    </header>
  );
}
