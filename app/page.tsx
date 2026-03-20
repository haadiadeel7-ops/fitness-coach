"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { loadUser, createUser, recordMessage, updateProfile, signOut, UserData, UserProfile } from "@/lib/storage";
import { getLevelForMessages } from "@/lib/levels";
import Onboarding from "@/components/Onboarding";
import ChatPanel, { Message } from "@/components/ChatPanel";
import Sidebar from "@/components/Sidebar";
import LevelUpModal from "@/components/LevelUpModal";
import ShareModal from "@/components/ShareModal";
import ProfileModal from "@/components/ProfileModal";

const WEBHOOK_URL = process.env.NEXT_PUBLIC_WEBHOOK_URL!;

export default function Home() {
  const [user, setUser] = useState<UserData | null>(null);
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [levelUpName, setLevelUpName] = useState<string | null>(null);
  const [showShare, setShowShare] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const prevLevelRef = useRef<number>(1);

  useEffect(() => {
    setMounted(true);
    const saved = loadUser();
    if (saved) {
      setUser(saved);
      prevLevelRef.current = getLevelForMessages(saved.messageCount).level;
    }
  }, []);

  const handleStart = useCallback((name: string) => {
    const newUser = createUser(name);
    setUser(newUser);
    prevLevelRef.current = 1;
    // Prompt profile setup after onboarding
    setShowProfile(true);
  }, []);

  const handleSaveProfile = useCallback((profile: UserProfile) => {
    if (!user) return;
    const updated = updateProfile(user, profile);
    setUser(updated);
  }, [user]);

  const handleSignOut = useCallback(() => {
    signOut();
    setUser(null);
    setMessages([]);
    prevLevelRef.current = 1;
  }, []);

  const handleSend = useCallback(
    async (content: string) => {
      if (!user || loading) return;

      const userMsg: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content,
      };

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
        const reply =
          data.reply ||
          "I couldn't process that response. Please try again.";

        const coachMsg: Message = {
          id: crypto.randomUUID(),
          role: "coach",
          content: reply,
        };

        setMessages((prev) => [...prev, coachMsg]);

        const updated = recordMessage(user);
        setUser(updated);

        const newLevel = getLevelForMessages(updated.messageCount).level;
        if (newLevel > prevLevelRef.current) {
          setLevelUpName(getLevelForMessages(updated.messageCount).name);
          prevLevelRef.current = newLevel;
        }
      } catch {
        const errMsg: Message = {
          id: crypto.randomUUID(),
          role: "coach",
          content:
            "Couldn't reach the server. Check your connection and try again.",
        };
        setMessages((prev) => [...prev, errMsg]);
      } finally {
        setLoading(false);
      }
    },
    [user, loading]
  );

  if (!mounted) return null;

  if (!user) {
    return <Onboarding onStart={handleStart} />;
  }

  return (
    <div className="app-layout">
      <ChatPanel
        user={user}
        messages={messages}
        loading={loading}
        onSend={handleSend}
        onOpenSidebar={() => setMobileSidebarOpen(true)}
      />

      {/* Mobile overlay backdrop */}
      {mobileSidebarOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileSidebarOpen(false)}
        />
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
        <LevelUpModal
          levelName={levelUpName}
          onClose={() => setLevelUpName(null)}
        />
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
