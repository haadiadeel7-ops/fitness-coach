"use client";

import { useState } from "react";

interface User {
  email: string;
  name: string;
  password?: string;
  messageCount: number;
  streak: number;
  createdAt: string;
  updatedAt: string;
  profile?: {
    age?: number;
    gender?: string;
    goal?: string;
    heightCm?: number;
    weightKg?: number;
    activityLevel?: string;
  };
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

export default function AdminPage() {
  const [adminPass, setAdminPass] = useState("");
  const [users, setUsers] = useState<User[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPass }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Wrong password");
      } else {
        setUsers(data.users);
      }
    } catch {
      setError("Failed to connect");
    } finally {
      setLoading(false);
    }
  }

  function toggleReveal(email: string) {
    setRevealed((prev) => {
      const next = new Set(prev);
      next.has(email) ? next.delete(email) : next.add(email);
      return next;
    });
  }

  function copyPassword(email: string, pass: string) {
    navigator.clipboard.writeText(pass);
    setCopied(email);
    setTimeout(() => setCopied(""), 1500);
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }

  if (users) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", padding: "40px 32px", fontFamily: "var(--font-syne)" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px" }}>
            <div>
              <div style={{ fontSize: "10px", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--accent)", fontFamily: "var(--font-space-mono)", marginBottom: "6px" }}>FitCoach Admin</div>
              <h1 style={{ fontSize: "24px", fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>Users</h1>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ background: "var(--surface-2)", border: "1px solid var(--border)", padding: "10px 18px", fontSize: "13px", fontFamily: "var(--font-space-mono)", color: "var(--text-muted)" }}>
                {users.length} registered
              </div>
              <button
                onClick={() => setRevealed(revealed.size === users.length ? new Set() : new Set(users.map((u) => u.email)))}
                style={{ background: "var(--surface-2)", border: "1px solid var(--border-2)", color: "var(--text-muted)", padding: "10px 14px", fontSize: "11px", cursor: "pointer", fontFamily: "var(--font-syne)", letterSpacing: "0.06em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px" }}
              >
                <EyeIcon open={revealed.size > 0} />
                {revealed.size === users.length ? "Hide all" : "Show all"}
              </button>
            </div>
          </div>

          <div style={{ border: "1px solid var(--border)", overflow: "hidden" }}>
            {/* Table header */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 160px 80px 70px 90px 1.1fr", background: "var(--surface-2)", borderBottom: "1px solid var(--border)", padding: "10px 20px", gap: "16px" }}>
              {["Name", "Email", "Password", "Messages", "Streak", "Goal", "Joined"].map((h) => (
                <div key={h} style={{ fontSize: "9px", letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-dim)", fontFamily: "var(--font-space-mono)" }}>{h}</div>
              ))}
            </div>

            {users.length === 0 && (
              <div style={{ padding: "40px", textAlign: "center", color: "var(--text-dim)", fontSize: "13px", fontFamily: "var(--font-space-mono)" }}>No users yet</div>
            )}

            {users.map((u, i) => {
              const isRevealed = revealed.has(u.email);
              const isCopied = copied === u.email;
              return (
                <div
                  key={u.email}
                  style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 160px 80px 70px 90px 1.1fr", padding: "14px 20px", gap: "16px", borderBottom: i < users.length - 1 ? "1px solid var(--border)" : "none", alignItems: "center", background: i % 2 === 0 ? "transparent" : "var(--surface)" }}
                >
                  <div style={{ fontSize: "13px", fontWeight: 600 }}>{u.name || "-"}</div>

                  <div style={{ fontSize: "12px", color: "var(--text-muted)", fontFamily: "var(--font-space-mono)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{u.email}</div>

                  {/* Password cell */}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span style={{ fontSize: "12px", fontFamily: "var(--font-space-mono)", color: isRevealed ? "var(--text)" : "var(--text-dim)", letterSpacing: isRevealed ? "0" : "0.1em", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {u.password
                        ? isRevealed ? u.password : "\u2022".repeat(Math.min(u.password.length, 10))
                        : <span style={{ color: "var(--text-dim)", fontSize: "10px" }}>not stored</span>}
                    </span>
                    {u.password && (
                      <>
                        <button
                          onClick={() => toggleReveal(u.email)}
                          title={isRevealed ? "Hide" : "Reveal"}
                          style={{ background: "transparent", border: "none", color: "var(--text-dim)", cursor: "pointer", padding: "2px", display: "flex", alignItems: "center", flexShrink: 0, transition: "color 0.15s" }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent)")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-dim)")}
                        >
                          <EyeIcon open={isRevealed} />
                        </button>
                        {isRevealed && (
                          <button
                            onClick={() => copyPassword(u.email, u.password!)}
                            title="Copy"
                            style={{ background: "transparent", border: "none", color: isCopied ? "var(--accent)" : "var(--text-dim)", cursor: "pointer", padding: "2px", display: "flex", alignItems: "center", flexShrink: 0, fontSize: "9px", fontFamily: "var(--font-space-mono)", letterSpacing: "0.06em", transition: "color 0.15s" }}
                          >
                            {isCopied ? "copied" : (
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                              </svg>
                            )}
                          </button>
                        )}
                      </>
                    )}
                  </div>

                  <div style={{ fontSize: "13px", color: u.messageCount > 0 ? "var(--accent)" : "var(--text-dim)", fontWeight: 700, fontFamily: "var(--font-space-mono)" }}>{u.messageCount}</div>
                  <div style={{ fontSize: "13px", color: "var(--text-muted)", fontFamily: "var(--font-space-mono)" }}>{u.streak}d</div>
                  <div style={{ fontSize: "11px", color: "var(--text-dim)", textTransform: "capitalize" }}>{u.profile?.goal || "-"}</div>
                  <div style={{ fontSize: "11px", color: "var(--text-dim)", fontFamily: "var(--font-space-mono)" }}>{formatDate(u.createdAt)}</div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => { setUsers(null); setAdminPass(""); setRevealed(new Set()); }}
            style={{ marginTop: "24px", background: "transparent", border: "1px solid var(--border)", color: "var(--text-muted)", padding: "8px 16px", fontSize: "11px", cursor: "pointer", fontFamily: "var(--font-syne)", letterSpacing: "0.06em", textTransform: "uppercase" }}
          >Lock</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-syne)" }}>
      <div style={{ width: "320px", border: "1px solid var(--border)", background: "var(--surface)", padding: "36px 32px" }}>
        <div style={{ fontSize: "9px", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--accent)", fontFamily: "var(--font-space-mono)", marginBottom: "8px" }}>FitCoach</div>
        <h1 style={{ fontSize: "20px", fontWeight: 800, letterSpacing: "-0.02em", margin: "0 0 28px" }}>Admin Access</h1>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <input
            type="password"
            placeholder="Admin password"
            value={adminPass}
            onChange={(e) => setAdminPass(e.target.value)}
            autoFocus
            style={{ background: "var(--surface-2)", border: `1px solid ${error ? "#ff4444" : "var(--border-2)"}`, color: "var(--text)", padding: "12px 14px", fontSize: "14px", fontFamily: "var(--font-syne)", outline: "none" }}
          />
          {error && <div style={{ fontSize: "12px", color: "#ff4444", fontFamily: "var(--font-space-mono)" }}>{error}</div>}
          <button
            type="submit"
            disabled={loading || !adminPass}
            style={{ background: adminPass && !loading ? "var(--accent)" : "var(--surface-3)", color: adminPass && !loading ? "var(--accent-fg)" : "var(--text-muted)", border: "none", padding: "12px", fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", cursor: adminPass && !loading ? "pointer" : "not-allowed", fontFamily: "var(--font-syne)" }}
          >
            {loading ? "Checking..." : "Access"}
          </button>
        </form>
      </div>
    </div>
  );
}
