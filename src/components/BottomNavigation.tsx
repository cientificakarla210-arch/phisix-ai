import React from "react";
import { Home, MessageSquare, Scan, History, Sparkles } from "lucide-react";
import { TabType } from "../types";

interface BottomNavigationProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  showSparklesBtn?: boolean;
  onSparklesClick?: () => void;
}

export default function BottomNavigation({
  activeTab,
  onChangeTab,
  showSparklesBtn = false,
  onSparklesClick,
}: BottomNavigationProps) {
  const tabs = [
    { id: "home" as TabType, label: "Inicio", icon: Home },
    { id: "chat" as TabType, label: "Tutor", icon: MessageSquare },
    { id: "scanner" as TabType, label: "Escáner", icon: Scan },
    { id: "history" as TabType, label: "Historial", icon: History },
  ];

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl md:max-w-3xl lg:max-w-5xl pointer-events-none px-4 pb-4 transition-all duration-300">
      {/* Sparkles Floating Action Button on Home view */}
      {showSparklesBtn && (
        <div className="flex justify-end mb-4 pr-1 pointer-events-auto">
          <button
            onClick={onSparklesClick}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white shadow-[0_0_20px_rgba(59,130,246,0.5)] flex items-center justify-center transition-all hover:scale-110 active:scale-95 group relative overflow-hidden"
            aria-label="Tutoría rápida"
          >
            {/* Pulsing halo */}
            <div className="absolute inset-0 bg-white/20 scale-0 group-hover:scale-100 transition-transform duration-300 rounded-full" />
            <Sparkles className="w-6 h-6 animate-pulse" />
          </button>
        </div>
      )}

      {/* Actual sticky navigation bar bar styled exactly like bottom screens */}
      <nav className="w-full h-18 rounded-2xl bg-[#09101d]/95 backdrop-blur-xl border border-white/5 shadow-[0_-10px_35px_rgba(0,0,0,0.8)] flex items-center justify-around px-2 pointer-events-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className="flex flex-col items-center justify-center flex-1 py-1 text-slate-400 hover:text-white transition-all space-y-1 group relative h-full"
              aria-label={tab.label}
            >
              {/* Active glow pointer */}
              {isActive && (
                <span className="absolute top-1 w-5 h-1 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
              )}

              <div
                className={`p-2 rounded-xl transition-all duration-300 ${
                  isActive
                    ? "bg-blue-600 text-white scale-110 shadow-[0_4px_15px_rgba(37,99,235,0.4)]"
                    : "group-hover:bg-white/5 text-slate-400"
                }`}
              >
                <Icon className="w-5 h-5 font-bold" />
              </div>

              {/* Tag below (or hidden to maintain minimalistic clean fit) */}
              <span className={`text-[10px] font-medium tracking-wide transition-all ${
                isActive ? "text-blue-400 font-bold scale-105" : "text-slate-500 font-normal group-hover:text-slate-300"
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
