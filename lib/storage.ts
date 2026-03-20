export interface UserProfile {
  age: string;
  gender: string;       // "male" | "female" | "other" | ""
  heightCm: string;
  weightKg: string;
  goal: string;         // e.g. "Build muscle"
  activityLevel: string;// e.g. "Moderately active"
}

export interface UserData {
  name: string;
  sessionId: string;
  messageCount: number;
  streak: number;
  lastChatDate: string | null; // "YYYY-MM-DD"
  profile: UserProfile;
}

export const EMPTY_PROFILE: UserProfile = {
  age: "",
  gender: "",
  heightCm: "",
  weightKg: "",
  goal: "",
  activityLevel: "",
};

const KEY = "fitcoach_v1";

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function yesterdayStr(): string {
  return new Date(Date.now() - 86_400_000).toISOString().split("T")[0];
}

export function loadUser(): UserData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as UserData;
    // migrate old saves that lack profile
    if (!data.profile) data.profile = { ...EMPTY_PROFILE };
    return data;
  } catch {
    return null;
  }
}

export function saveUser(data: UserData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function createUser(name: string): UserData {
  const user: UserData = {
    name: name.trim(),
    sessionId: crypto.randomUUID(),
    messageCount: 0,
    streak: 0,
    lastChatDate: null,
    profile: { ...EMPTY_PROFILE },
  };
  saveUser(user);
  return user;
}

export function updateProfile(user: UserData, profile: UserProfile): UserData {
  const updated = { ...user, profile };
  saveUser(updated);
  return updated;
}

export function signOut(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}

export function recordMessage(user: UserData): UserData {
  const today = todayStr();
  const yesterday = yesterdayStr();

  let streak = user.streak;
  if (user.lastChatDate === today) {
    // same day — no change
  } else if (user.lastChatDate === yesterday || user.lastChatDate === null) {
    streak = streak + 1;
  } else {
    streak = 1;
  }

  const updated: UserData = {
    ...user,
    messageCount: user.messageCount + 1,
    streak,
    lastChatDate: today,
  };
  saveUser(updated);
  return updated;
}
