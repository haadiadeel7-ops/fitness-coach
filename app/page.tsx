"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession, signOut as nextAuthSignOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { loadUser, createUser, recordMessage, updateProfile, signOut, UserData, UserProfile, EMPTY_PROFILE } from "@/lib/storage";
import {
  loadSessions,
  saveSessions,
  createSession,
  upsertSession,
  deleteSession,
  ChatSession,
} from "@/lib/sessions";
import { Message } from "@/lib/types";
import { getLevelForMessages } from "@/lib/levels";
import Onboarding from "@/components/Onboarding";
import ChatPanel from "@/components/ChatPanel";
import Sidebar from "@/components/Sidebar";
import SessionsPanel from "@/components/SessionsPanel";
import LevelUpModal from "@/components/LevelUpModal";
import ShareModal from "@/components/ShareModal";
import ProfileModal from "@/components/ProfileModal";

const WEBHOOK_URL = process.env.NEXT_PUBLIC_WEBHOOK_URL!;
const GUEST_DAILY_LIMIT = 7;

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function getGuestDailyCount(): number {
  try {
    const raw = localStorage.getItem("fitcoach_guest_daily");
    if (!raw) return 0;
    const { count, date } = JSON.parse(raw);
    return date === todayStr() ? count : 0;
  } catch { return 0; }
}

function incrementGuestDailyCount(current: number): number {
  const next = current + 1;
  localStorage.setItem("fitcoach_guest_daily", JSON.stringify({ count: next, date: todayStr() }));
  return next;
}

function generateTitle(message: string): string {
  let t = message.trim();
  t = t.replace(/^(hi|hello|hey|can you|could you|please|i want to|i need|i would like|help me|what is|what are|how do i|how can i|tell me|give me|show me|i am|i'm|my name is)\s+/gi, "");
  t = t.split(/[.!?]/)[0].trim();
  if (t.length > 38) t = t.slice(0, 38).trimEnd() + "\u2026";
  return t.charAt(0).toUpperCase() + t.slice(1) || "New Chat";
}

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [guestDailyCount, setGuestDailyCount] = useState(0);

  // Sessions
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionsOpen, setSessionsOpen] = useState(false);
  const [mobileSessionsOpen, setMobileSessionsOpen] = useState(false);

  // UI state
  const [loading, setLoading] = useState(false);
  const [levelUpName, setLevelUpName] = useState<string | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const prevLevelRef = useRef<number>(1);
  const activeIdRef = useRef<string | null>(null);
  useEffect(() => { activeIdRef.current = activeSessionId; }, [activeSessionId]);

  // Redirect unauthenticated non-guest users to /auth
  useEffect(() => {
    if (status === "unauthenticated") {
      const guestMode = typeof window !== "undefined" && localStorage.getItem("fitcoach_guest") === "true";
      if (!guestMode) router.replace("/auth");
    }
  }, [status, router]);

  // Authenticated user setup
  useEffect(() => {
    if (status !== "authenticated") return;
    setMounted(true);

    let savedUser = loadUser();
    if (savedUser && session?.user?.name && savedUser.name !== session.user.name) {
      signOut();
      savedUser = null;
    }
    if (!savedUser && session?.user?.name) {
      savedUser = createUser(session.user.name);
    }
    if (savedUser) {
      setUser(savedUser);
      prevLevelRef.current = getLevelForMessages(savedUser.messageCount).level;
    }

    let allSessions = loadSessions();
    const lastVisit = localStorage.getItem("fitcoach_last_visit");
    const now = Date.now();
    const shouldStartFresh = !lastVisit || now - parseInt(lastVisit) > 5 * 60 * 1000;
    localStorage.setItem("fitcoach_last_visit", String(now));

    if (allSessions.length === 0 || shouldStartFresh) {
      const fresh = createSession();
      allSessions = [fresh, ...allSessions];
      saveSessions(allSessions);
    }
    setSessions(allSessions);
    setActiveSessionId(allSessions[0].id);
    setMessages(allSessions[0].messages);
  }, [status, session]);

  // Guest user setup
  useEffect(() => {
    if (status !== "unauthenticated") return;
    if (typeof window === "undefined") return;
    if (localStorage.getItem("fitcoach_guest") !== "true") return;

    setIsGuest(true);
    setMounted(true);

    let guestSessionId = localStorage.getItem("fitcoach_guest_session_id");
    if (!guestSessionId) {
      guestSessionId = crypto.randomUUID();
      localStorage.setItem("fitcoach_guest_session_id", guestSessionId);
    }

    const guestUser: UserData = {
      name: "Guest",
      sessionId: guestSessionId,
      messageCount: 0,
      streak: 0,
      lastChatDate: null,
      profile: { ...EMPTY_PROFILE },
    };
    setUser(guestUser);
    setGuestDailyCount(getGuestDailyCount());

    let allSessions = loadSessions();
    const lastVisit = localStorage.getItem("fitcoach_last_visit");
    const now = Date.now();
    const shouldStartFresh = !lastVisit || now - parseInt(lastVisit) > 5 * 60 * 1000;
    localStorage.setItem("fitcoach_last_visit", String(now));

    if (allSessions.length === 0 || shouldStartFresh) {
      const fresh = createSession();
      allSessions = [fresh, ...allSessions];
      saveSessions(allSessions);
    }
    setSessions(allSessions);
    setActiveSessionId(allSessions[0].id);
    setMessages(allSessions[0].messages);
  }, [status]);

  /* ── Session helpers ── */

  const handleNewChat = useCallback(() => {
    const newSession = createSession();
    setSessions((prev) => {
      const updated = [newSession, ...prev];
      saveSessions(updated);
      return updated;
    });
    setActiveSessionId(newSession.id);
    setMessages([]);
    setMobileSessionsOpen(false);
  }, []);

  const handleSelectSession = useCallback((id: string) => {
    setSessions((prev) => {
      const session = prev.find((s) => s.id === id);
      if (session) {
        setActiveSessionId(id);
        setMessages(session.messages);
      }
      return prev;
    });
    setMobileSessionsOpen(false);
  }, []);

  const handleRenameSession = useCallback((id: string, title: string) => {
    setSessions((prev) => {
      const updated = prev.map((s) =>
        s.id === id ? { ...s, title, updatedAt: new Date().toISOString() } : s
      );
      saveSessions(updated);
      return updated;
    });
  }, []);

  const handleDeleteSession = useCallback((id: string) => {
    setSessions((prev) => {
      const remaining = deleteSession(prev, id);
      if (id === activeIdRef.current) {
        if (remaining.length > 0) {
          setActiveSessionId(remaining[0].id);
          setMessages(remaining[0].messages);
        } else {
          const fresh = createSession();
          const withFresh = [fresh, ...remaining];
          saveSessions(withFresh);
          setActiveSessionId(fresh.id);
          setMessages([]);
          return withFresh;
        }
      }
      saveSessions(remaining);
      return remaining;
    });
  }, []);

  /* ── User helpers ── */

  const handleStart = useCallback((name: string) => {
    const newUser = createUser(name);
    setUser(newUser);
    prevLevelRef.current = 1;
    setShowProfile(true);
  }, []);

  const handleSaveProfile = useCallback((profile: UserProfile) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, profile };
      import("@/lib/storage").then(({ saveUser }) => saveUser(updated));
      return updated;
    });
  }, []);

  const handleSignOut = useCallback(() => {
    if (isGuest) {
      localStorage.removeItem("fitcoach_guest");
      localStorage.removeItem("fitcoach_guest_session_id");
      localStorage.removeItem("fitcoach_guest_daily");
      setUser(null);
      setMessages([]);
      setSessions([]);
      router.replace("/auth");
      return;
    }
    signOut();
    setUser(null);
    setMessages([]);
    setSessions([]);
    prevLevelRef.current = 1;
    nextAuthSignOut({ callbackUrl: "/auth" });
  }, [isGuest, router]);

  /* ── Send message ── */

  const handleSend = useCallback(
    async (content: string) => {
      if (!user || loading) return;

      // Guest daily limit check
      if (isGuest) {
        const currentCount = getGuestDailyCount();
        if (currentCount >= GUEST_DAILY_LIMIT) {
          const limitMsg: Message = {
            id: crypto.randomUUID(),
            role: "coach",
            content: `You've used all ${GUEST_DAILY_LIMIT} guest messages for today. [Create a free account](/auth) for unlimited messages and AI image generation.`,
          };
          setMessages((prev) => [...prev, limitMsg]);
          return;
        }
      }

      let sessionId = activeIdRef.current;
      if (!sessionId) {
        const newSession = createSession();
        setSessions((prev) => {
          const updated = [newSession, ...prev];
          saveSessions(updated);
          return updated;
        });
        sessionId = newSession.id;
        setActiveSessionId(sessionId);
      }

      const userMsg: Message = { id: crypto.randomUUID(), role: "user", content };
      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);

      try {
        const res = await fetch(WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: content,
            sessionId: user.sessionId,
            profile: {
              name: user.name,
              age: user.profile.age || null,
              gender: user.profile.gender || null,
              heightCm: user.profile.heightCm || null,
              weightKg: user.profile.weightKg || null,
              goal: user.profile.goal || null,
              activityLevel: user.profile.activityLevel || null,
            },
          }),
        });

        const data = await res.json();
        const reply = data.reply || "I couldn't process that response. Please try again.";
        const coachMsg: Message = { id: crypto.randomUUID(), role: "coach", content: reply };

        setMessages((prev) => {
          const updated = [...prev, coachMsg];
          const sid = activeIdRef.current;
          if (sid) {
            setSessions((allSessions) => {
              const session = allSessions.find((s) => s.id === sid);
              if (!session) return allSessions;
              const updatedSession: ChatSession = {
                ...session,
                messages: updated,
                title: session.title || generateTitle(content),
                updatedAt: new Date().toISOString(),
              };
              const newSessions = upsertSession(allSessions, updatedSession);
              saveSessions(newSessions);
              return newSessions;
            });
          }
          return updated;
        });

        if (isGuest) {
          const newCount = incrementGuestDailyCount(getGuestDailyCount());
          setGuestDailyCount(newCount);
        } else {
          const updated = recordMessage(user);
          setUser(updated);
          const newLevel = getLevelForMessages(updated.messageCount).level;
          if (newLevel > prevLevelRef.current) {
            setLevelUpName(getLevelForMessages(updated.messageCount).name);
            prevLevelRef.current = newLevel;
          }
        }
      } catch {
        const errMsg: Message = {
          id: crypto.randomUUID(),
          role: "coach",
          content: "Couldn't reach the server. Check your connection and try again.",
        };
        setMessages((prev) => [...prev, errMsg]);
      } finally {
        setLoading(false);
      }
    },
    [user, loading, isGuest]
  );

  if (status === "loading" || !mounted) return null;
  if (status === "unauthenticated" && !isGuest) return null;

  if (!user) {
    return <Onboarding onStart={handleStart} />;
  }

  const toggleSessions = () => {
    if (window.innerWidth <= 768) {
      setMobileSessionsOpen((v) => !v);
    } else {
      setSessionsOpen((v) => !v);
    }
  };

  const guestMessagesLeft = Math.max(0, GUEST_DAILY_LIMIT - guestDailyCount);

  return (
    <div className="app-layout">
      {mobileSessionsOpen && (
        <div className="sessions-backdrop" onClick={() => setMobileSessionsOpen(false)} />
      )}

      <SessionsPanel
        sessions={sessions}
        activeId={activeSessionId}
        onSelect={handleSelectSession}
        onNew={handleNewChat}
        onDelete={handleDeleteSession}
        onRename={handleRenameSession}
        onClose={() => { setSessionsOpen(false); setMobileSessionsOpen(false); }}
        mobileOpen={mobileSessionsOpen}
        desktopVisible={sessionsOpen}
      />

      <ChatPanel
        user={user}
        messages={messages}
        loading={loading}
        onSend={handleSend}
        onOpenSidebar={() => setMobileSidebarOpen(true)}
        onOpenSessions={toggleSessions}
        sessionsOpen={sessionsOpen}
        isGuest={isGuest}
        guestMessagesLeft={guestMessagesLeft}
      />

      {mobileSidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setMobileSidebarOpen(false)} />
      )}

      <Sidebar
        user={user}
        onShare={() => setShowShare(true)}
        onEditProfile={() => setShowProfile(true)}
        onSignOut={handleSignOut}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {levelUpName && (
        <LevelUpModal levelName={levelUpName} onClose={() => setLevelUpName(null)} />
      )}

      {showShare && (
        <ShareModal user={user} onClose={() => setShowShare(false)} />
      )}

      {showProfile && (
        <ProfileModal
          user={user}
          onSave={handleSaveProfile}
          onClose={() => setShowProfile(false)}
        />
      )}
    </div>
  );
}
