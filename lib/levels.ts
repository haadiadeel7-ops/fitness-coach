export interface Level {
  level: number;
  name: string;
  minMessages: number;
  maxMessages: number | null;
}

export const LEVELS: Level[] = [
  { level: 1, name: "Couch Potato",    minMessages: 0,   maxMessages: 4   },
  { level: 2, name: "Weekend Warrior", minMessages: 5,   maxMessages: 14  },
  { level: 3, name: "Athlete",         minMessages: 15,  maxMessages: 34  },
  { level: 4, name: "Beast Mode",      minMessages: 35,  maxMessages: 74  },
  { level: 5, name: "Legend",          minMessages: 75,  maxMessages: 149 },
  { level: 6, name: "G.O.A.T.",        minMessages: 150, maxMessages: null },
];

export function getLevelForMessages(count: number): Level {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (count >= LEVELS[i].minMessages) return LEVELS[i];
  }
  return LEVELS[0];
}

export function getProgress(count: number): {
  current: number;
  total: number;
  pct: number;
  nextLevel: Level | null;
} {
  const cur = getLevelForMessages(count);
  const next = LEVELS.find((l) => l.level === cur.level + 1) ?? null;
  if (!next) return { current: 0, total: 0, pct: 100, nextLevel: null };
  const current = count - cur.minMessages;
  const total = next.minMessages - cur.minMessages;
  return { current, total, pct: Math.min((current / total) * 100, 100), nextLevel: next };
}
