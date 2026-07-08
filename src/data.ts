import { PhysicsCategory, SolverExercise, TopicMastery } from "./types";

export const PHYSICS_CATEGORIES: PhysicsCategory[] = [
  {
    id: "mecanica",
    name: "Mecánica",
    iconName: "Bag", // We can map to Custom Icons or Lucide tags
    color: "from-blue-600/20 to-blue-500/10 border-blue-500/20 text-blue-400",
  },
  {
    id: "termodinamica",
    name: "Termodidámica", // Typo from screenshot: "Termodinámica"
    iconName: "Flame",
    color: "from-orange-600/20 to-orange-500/10 border-orange-500/20 text-orange-400",
  },
  {
    id: "optica",
    name: "Óptica",
    iconName: "Eye",
    color: "from-purple-600/20 to-purple-500/10 border-purple-500/20 text-purple-400",
  },
  {
    id: "electromagnetismo",
    name: "Electromagnetismo",
    iconName: "Sparkles",
    color: "from-cyan-600/20 to-cyan-500/10 border-cyan-500/20 text-cyan-400",
  },
];

export const INITIAL_EXERCISES: SolverExercise[] = [
  {
    id: "ex-newton-init",
    title: "Leyes de Newton - Dinámica",
    category: "Mecánica Clásica",
    timestamp: "Hace 2 horas",
    status: "perfect",
    statusText: "Resolución perfecta",
    attempts: 1,
    createdAt: Date.now() - (2 * 60 * 60 * 1000 + 15 * 60 * 1000), // 2 hours and 15 minutes ago
  },
  {
    id: "ex-1",
    title: "Caída Libre - Mecánica",
    category: "Mecánica Clásica",
    timestamp: "Ayer",
    status: "perfect",
    statusText: "Resolución perfecta",
    attempts: 1,
    createdAt: Date.now() - (24 * 60 * 60 * 1000), // 24 hours ago
  },
  {
    id: "ex-2",
    title: "Circuitos RC - Electricidad",
    category: "Electromagnetismo",
    timestamp: "Hace 2 días",
    status: "trying",
    statusText: "2 intentos",
    attempts: 2,
    createdAt: Date.now() - (48 * 60 * 60 * 1000), // 48 hours ago
  },
  {
    id: "ex-3",
    title: "Óptica Geométrica",
    category: "Óptica",
    timestamp: "Hace 1 semana",
    status: "reviewed",
    statusText: "Revisado por IA",
    createdAt: Date.now() - (7 * 24 * 60 * 60 * 1000), // 7 days ago
  },
];

export const INITIAL_MASTERY: TopicMastery[] = [
  {
    topic: "Mecánica Clásica",
    percentage: 92,
    level: "EXPERTO",
    color: "bg-blue-500",
  },
  {
    topic: "Electromagnetismo",
    percentage: 76,
    level: "AVANZADO",
    color: "bg-cyan-500",
  },
];

export const FORMULA_OF_THE_DAY = {
  equation: "F = m · a",
  name: "Segunda Ley de Newton",
  description: "La fuerza neta sobre un objeto es igual al producto de su masa por su aceleración.",
};
