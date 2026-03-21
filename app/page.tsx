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
import Sidebar from "@/components/Sidebar";
import ChatPanel from "@/components/ChatPanel";
import ProfileModal from "@/components/ProfileModal";
import SessionsPanel from "@/components/SessionsPanel";

function getLevelForMessages(count: number) {
  if (count < 10) return { level: 1, name: "Beginner" };
  if (count < 25) return { level: 2, name: "Active" };
  if (count < 50) return { level: 3, name: "Dedicated" };
  if (count < 100) return { level: 4, name: "Advanced" };
  return { level: 5, name: "Elite" };
}

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [mounted, setMounted] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessionsOpen, setSessionsOpen] = useState(true);
  const [mobileSessionsOpen, setMobileSessionsOpen] = useState(false);
  const activeIdRef = useRef<string | null>(null);
  const prevLevelRef = useRef(1);

  useEffect(() => {
    activeIdRef.current = activeSessionId;
  }, [activeSessionId]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    setMounted(true);

    let savedUser = loadUser();
    // Reset localStorage if it belongs to a different user
    if (savedUser && session?.user?.name && savedUser.name !== session.user.name) {
      signOut();
      savedUser = null;
    }
    // Auto-create localStorage user from NextAuth session on first sign-in
    if (!savedUser && session?.user?.name) {
      savedUser = createUser(session.user.name);
    }
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

  /* ── Session helpers ── */
  const handleNewChat = useCallback(() => {
    const fresh = createSession();
    setSessions((prev) => {
      const updated = [fresh, ...prev];
      saveSessions(updated);
      return updated;
    });
    setActiveSessionId(fresh.id);
    setMessages([]);
    setMobileSessionsOpen(false);
  }, []);

  const handleSelectSession = useCallback(
    (id: string) => {
      const found = sessions.find((s) => s.id === id);
      if (!found) return;
      setActiveSessionId(id);
      setMessages(found.messages);
      setMobileSessionsOpen(false);
    },
    [sessions]
  );

  const handleDeleteSession = useCallback(
    (id: string) => {
      setSessions((prev) => {
        const updated = deleteSession(prev, id);
        saveSessions(updated);
        if (id === activeIdRef.current) {
          if (updated.length === 0) {
            const fresh = createSession();
            saveSessions([fresh]);
            setActiveSessionId(fresh.id);
            setMessages([]);
            return [fresh];
          }
          setActiveSessionId(updated[0].id);
          setMessages(updated[0].messages);
        }
        return updated;
      });
    },
    []
  );

  const toggleSessions = useCallback(() => {
    if (window.innerWidth <= 768) {
      setMobileSessionsOpen((v) => !v);
    } else {
      setSessionsOpen((v) => !v);
    }
  }, []);

  /* ── Chat ── */
  const handleSend = useCallback(
    async (text: string) => {
      if (!user) return;

      const userMsg: Message = { id: Date.now().toString(), role: "user", content: text };
      setMessages((prev) => [...prev, userMsg]);

      const updatedUser = recordMessage(user);
      setUser(updatedUser);

      const sessionId = updatedUser.sessionId;
      const p = updatedUser.profile;
      const profilePayload =
        p.age || p.gender || p.heightCm || p.weightKg || p.goal || p.activityLevel
          ? {
              age: p.age || null,
              gender: p.gender || null,
              heightCm: p.heightCm || null,
              weightKg: p.weightKg || null,
              goal: p.goal || null,
              activityLevel: p.activityLevel || null,
            }
          : null;

      try {
        const res = await fetch(process.env.NEXT_PUBLIC_WEBHOOK_URL!, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text, sessionId, profile: profilePayload }),
        });
        const data = await res.json();
        const reply = data.reply || data.output || data.text || "Sorry, I couldn't get a response.";
        const coachMsg: Message = { id: (Date.now() + 1).toString(), role: "coach", content: reply };

        setMessages((prev) => {
          const updated = [...prev, coachMsg];
          const currentId = activeIdRef.current;
          if (currentId) {
            setSessions((prevSessions) => {
              const target = prevSessions.find((s) => s.id === currentId);
              const title =
                target?.title === "New Chat"
                  ? text.slice(0, 52) + (text.length > 52 ? "…" : "")
                  : target?.title ?? "New Chat";
              const updatedSessions = upsertSession(prevSessions, {
                ...(target ?? createSession()),
                id: currentId,
                title,
                messages: updated,
              });
              saveSessions(updatedSessions);
              return updatedSessions;
            });
          }
          return updated;
        });
      } catch {
        const errMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "coach",
          content: "Connection error. Please try again.",
        };
        setMessages((prev) => [...prev, errMsg]);
      }
    },
    [user]
  );

  /* ── Profile ── */
  const handleSaveProfile = useCallback(async (profile: UserProfile) => {
    setUser((prev) => {
      if (!prev) return prev;
      const { saveUser } = require("@/lib/storage");
      const updated = updateProfile(prev, profile);
      saveUser(updated);
      return updated;
    });
  }, []);

  /* ── Sign out ── */
  const handleSignOut = useCallback(() => {
    signOut();
    setUser(null);
    setMessages([]);
    setSessions([]);
    prevLevelRef.current = 1;
    nextAuthSignOut({ callbackUrl: "/auth" });
  }, []);

  if (!mounted || status === "loading") return null;

  const levelInfo = getLevelForMessages(user?.messageCount ?? 0);

  return (
    <div style={{ display: "flex", height: "100dvh", background: "#080808", overflow: "hidden", position: "relative" }}>
      {/* Mobile backdrop */}
      {mobileSessionsOpen && (
        <div
          className="sessions-backdrop"
          onClick={() => setMobileSessionsOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 40 }}
        />
      )}

      <SessionsPanel
        sessions={sessions}
        activeId={activeSessionId}
        onSelect={handleSelectSession}
        onNew={handleNewChat}
        onDelete={handleDeleteSession}
        onClose={() => {
          setSessionsOpen(false);
          setMobileSessionsOpen(false);
        }}
        mobileOpen={mobileSessionsOpen}
        desktopVisible={sessionsOpen}
      />

      <Sidebar
        name={user?.name ?? ""}
        messageCount={user?.messageCount ?? 0}
        streak={user?.streak ?? 0}
        level={levelInfo.level}
        levelName={levelInfo.name}
        profile={user?.profile ?? { age: "", gender: "", heightCm: "", weightKg: "", goal: "", activityLevel: "" }}
        onEditProfile={() => setProfileOpen(true)}
        onSignOut={handleSignOut}
      />

      <ChatPanel
        messages={messages}
        onSend={handleSend}
        userName={user?.name ?? ""}
        onOpenSessions={toggleSessions}
        sessionsOpen={sessionsOpen || mobileSessionsOpen}
      />

      {profileOpen && user && (
        <ProfileModal
          user={user}
          onSave={handleSaveProfile}
          onClose={() => setProfileOpen(false)}
        />
      )}
    </div>
  );
}
