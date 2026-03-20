import { Message } from "./types";

export interface ChatSession {
  id: string;
  title: string;     // auto-set from first user message
  messages: Message[];
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

const KEY = "fitcoach_sessions_v1";

export function loadSessions(): ChatSession[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ChatSession[]) : [];
  } catch {
    return [];
  }
}

export function saveSessions(sessions: ChatSession[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(sessions));
}

export function createSession(): ChatSession {
  return {
    id: crypto.randomUUID(),
    title: "",
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function upsertSession(
  sessions: ChatSession[],
  updated: ChatSession
): ChatSession[] {
  const idx = sessions.findIndex((s) => s.id === updated.id);
  if (idx === -1) return [updated, ...sessions];
  const copy = [...sessions];
  copy[idx] = updated;
  return copy;
}

export function deleteSession(
  sessions: ChatSession[],
  id: string
): ChatSession[] {
  return sessions.filter((s) => s.id !== id);
}

export function formatSessionDate(isoStr: string): string {
  const d = new Date(isoStr);
  const now = new Date();
  const diffDays = Math.floor(
    (now.getTime() - d.getTime()) / 86_400_000
  );
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7)
    return d.toLocaleDateString("en", { weekday: "short" });
  return d.toLocaleDateString("en", { month: "short", day: "numeric" });
}
