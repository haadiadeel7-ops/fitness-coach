"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession, signOut as nextAuthSignOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { loadUser, createUser, recordMessage, updateProfile, signOut, UserData, UserProfile } from "@/lib/storage";
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

function generateTitle(message: string): string {
  let t = message.trim();
  t = t.replace(/^(hi|hello|hey|can you|could you|please|i want to|i need|i would like|help me|what is|what are|how do i|how can i|tell me|give me|show me|i am|i'm|my name is)\s+/gi, "");
  t = t.split(/[.!?]/)[0].trim();
  if (t.length > 38) t = t.slice(0, 38).trimEnd() + "…";
  return t.charAt(0).toUpperCase() + t.slice(1) || "New Chat";
}

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [mounted, setMounted] = useState(false);

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionsOpen, setSessionsOpen] = useState(false);
  const [mobileSessionsOpen, setMobileSessionsOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [levelUpName, setLevelUpName] = useState<string | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const prevLevelRef = useRef<number>(1);
  const activeIdRef = useRef<string | null>(null);
  useEffect(() => { activeIdRef.current = activeSessionId; }, [activeSessionId]);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/auth");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    setMounted(true);

    let savedUser = loadUser();
    if (savedUser && session?.user?.name && savedUser.name !== session.user.name) {
      signOut();
      savedUser = null;
    }
    if (!savedUser && session?.user?.name) savedUser = createUser(session.user.name);
    if (savedUser) {
      setUser(savedUser);
      prevLevelRef.current = getLevelForMessages(savedUser.messageCount).level;
    }

    let allSessions = loadSessions();
    if (allSessions.length === 0) {
      const fresh = createSession();
      allSessions = [fresh];
      saveSessions(allSessions);
    }
    setSessions(allSessions);
    setActiveSessionId(allSessions[0].id);
    setMessages(allSessions[0].messages);
  }, [status, session]);

  const handleNewChat = useCallback(() => {
    const newSession = createSession();
    setSessions((prev) => { const updated = [newSession, ...prev]; saveSessions(updated); return updated; });
    setActiveSessionId(newSession.id);
    setMessages([]);
    setMobileSessionsOpen(false);
  }, []);

  const handleSelectSession = useCallback((id: string) => {
    setSessions((prev) => {
      const s = prev.find((s) => s.id === id);
      if (s) { setActiveSessionId(id); setMessages(s.messages); }
      return prev;
    });
    setMobileSessionsOpen(false);
  }, []);

  const handleRenameSession = useCallback((id: string, title: string) => {
    setSessions((prev) => {
      const updated = prev.map((s) => s.id === id ? { ...s, title, updatedAt: new Date().toISOString() } : s);
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
    signOut();
    setUser(null);
    setMessages([]);
    setSessions([]);
    prevLevelRef.current = 1;
    nextAuthSignOut({ callbackUrl: "/auth" });
  }, []);

  const handleSend = useCallback(
    async (content: string) => {
      if (!user || loading) return;

      let sessionId = activeIdRef.current;
      if (!sessionId) {
        const newSession = createSession();
        setSessions((prev) => { const updated = [newSession, ...prev]; saveSessions(updated); return updated; });
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
              const s = allSessions.find((s) => s.id === sid);
              if (!s) return allSessions;
              const updatedSession: ChatSession = {
                ...s,
                messages: updated,
                title: s.title || generateTitle(content),
                updatedAt: new Date().toISOString(),
              };
              const newSessions = upsertSession(allSessions, updatedSession);
              saveSessions(newSessions);
              return newSessions;
            });
          }
          return updated;
        });

        const updated = recordMessage(user);
        setUser(updated);
        const newLevel = getLevelForMessages(updated.messageCount).level;
        if (newLevel > prevLevelRef.current) {
          setLevelUpName(getLevelForMessages(updated.messageCount).name);
          prevLevelRef.current = newLevel;
        }
      } catch {
        setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "coach", content: "Couldn't reach the server. Check your connection and try again." }]);
      } finally {
        setLoading(false);
      }
    },
    [user, loading]
  );

  if (status === "loading" || !mounted) return null;
  if (status === "unauthenticated") return null;
  if (!user) return <Onboarding onStart={handleStart} />;

  const toggleSessions = () => {
    if (window.innerWidth <= 768) setMobileSessionsOpen((v) => !v);
    else setSessionsOpen((v) => !v);
  };

  return (
    <div className="app-layout">
      {mobileSessionsOpen && <div className="sessions-backdrop" onClick={() => setMobileSessionsOpen(false)} />}

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
      />

      {mobileSidebarOpen && <div className="sidebar-backdrop" onClick={() => setMobileSidebarOpen(false)} />}

      <Sidebar
        user={user}
        onShare={() => setShowShare(true)}
        onEditProfile={() => setShowProfile(true)}
        onSignOut={handleSignOut}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {levelUpName && <LevelUpModal levelName={levelUpName} onClose={() => setLevelUpName(null)} />}
      {showShare && <ShareModal user={user} onClose={() => setShowShare(false)} />}
      {showProfile && <ProfileModal user={user} onSave={handleSaveProfile} onClose={() => setShowProfile(false)} />}
    </div>
  );
}
