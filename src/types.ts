export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export type TabType = "home" | "chat" | "scanner" | "history";

export interface SolverExercise {
  id: string;
  title: string;
  category: string;
  timestamp: string;
  status: "perfect" | "trying" | "reviewed";
  statusText: string;
  attempts?: number;
  createdAt?: number;
}

export interface TopicMastery {
  topic: string;
  percentage: number;
  level: "EXPERTO" | "AVANZADO" | "PRINCIPIANTE" | "INTERMEDIO";
  color: string;
}

export interface PhysicsCategory {
  id: string;
  name: string;
  iconName: string;
  color: string;
}
