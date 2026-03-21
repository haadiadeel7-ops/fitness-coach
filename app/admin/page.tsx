"use client";

import { useState } from "react";

interface User {
  email: string;
  name: string;
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

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [users, setUsers] = useState<User[] | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
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

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (users) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "var(--bg)",
        padding: "40px 32px",
        fontFamily: "var(--font-syne)",
      }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "32px",
          }}>
            <div>
              <div style={{
                fontSize: "10px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "var(--accent)",
                fontFamily: "var(--font-space-mono)",
                marginBottom: "6px",
              }}>FitCoach Admin</div>
              <h1 style={{
                fontSize: "24px",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                margin: 0,
              }}>Users</h1>
            </div>
            <div style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              padding: "10px 18px",
              fontSize: "13px",
              fontFamily: "var(--font-space-mono)",
              color: "var(--text-muted)",
            }}>
              {users.length} registered
            </div>
          </div>

          <div style={{ border: "1px solid var(--border)", overflow: "hidden" }}>
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1.4fr 80px 70px 100px 1.4fr",
              background: "var(--surface-2)",
              borderBottom: "1px solid var(--border)",
              padding: "10px 20px",
              gap: "16px",
            }}>
              {["Name", "Email", "Messages", "Streak", "Goal", "Joined"].map((h) => (
                <div key={h} style={{
                  fontSize: "9px",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "var(--text-dim)",
                  fontFamily: "var(--font-space-mono)",
                }}>{h}</div>
              ))}
            </div>

            {users.length === 0 && (
              <div style={{
                padding: "40px",
                textAlign: "center",
                color: "var(--text-dim)",
                fontSize: "13px",
                fontFamily: "var(--font-space-mono)",
              }}>No users yet</div>
            )}

            {users.map((u, i) => (
              <div
                key={u.email}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1.4fr 80px 70px 100px 1.4fr",
                  padding: "14px 20px",
                  gap: "16px",
                  borderBottom: i < users.length - 1 ? "1px solid var(--border)" : "none",
                  alignItems: "center",
                  background: i % 2 === 0 ? "transparent" : "var(--surface)",
                }}
              >
                <div style={{ fontSize: "13px", fontWeight: 600 }}>{u.name || "-"}</div>
                <div style={{
                  fontSize: "12px",
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-space-mono)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}>{u.email}</div>
                <div style={{
                  fontSize: "13px",
                  color: u.messageCount > 0 ? "var(--accent)" : "var(--text-dim)",
                  fontWeight: 700,
                  fontFamily: "var(--font-space-mono)",
                }}>{u.messageCount}</div>
                <div style={{
                  fontSize: "13px",
                  color: "var(--text-muted)",
                  fontFamily: "var(--font-space-mono)",
                }}>{u.streak}d</div>
                <div style={{
                  fontSize: "11px",
                  color: "var(--text-dim)",
                  textTransform: "capitalize",
                }}>{u.profile?.goal || "-"}</div>
                <div style={{
                  fontSize: "11px",
                  color: "var(--text-dim)",
                  fontFamily: "var(--font-space-mono)",
                }}>{formatDate(u.createdAt)}</div>
              </div>
            ))}
          </div>

          <button
            onClick={() => { setUsers(null); setPassword(""); }}
            style={{
              marginTop: "24px",
              background: "transparent",
              border: "1px solid var(--border)",
              color: "var(--text-muted)",
              padding: "8px 16px",
              fontSize: "11px",
              cursor: "pointer",
              fontFamily: "var(--font-syne)",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >Lock</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "var(--font-syne)",
    }}>
      <div style={{
        width: "320px",
        border: "1px solid var(--border)",
        background: "var(--surface)",
        padding: "36px 32px",
      }}>
        <div style={{
          fontSize: "9px",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--accent)",
          fontFamily: "var(--font-space-mono)",
          marginBottom: "8px",
        }}>FitCoach</div>
        <h1 style={{
          fontSize: "20px",
          fontWeight: 800,
          letterSpacing: "-0.02em",
          margin: "0 0 28px",
        }}>Admin Access</h1>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <input
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
            style={{
              background: "var(--surface-2)",
              border: `1px solid ${error ? "#ff4444" : "var(--border-2)"}`,
              color: "var(--text)",
              padding: "12px 14px",
              fontSize: "14px",
              fontFamily: "var(--font-syne)",
              outline: "none",
            }}
          />
          {error && (
            <div style={{ fontSize: "12px", color: "#ff4444", fontFamily: "var(--font-space-mono)" }}>
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading || !password}
            style={{
              background: password && !loading ? "var(--accent)" : "var(--surface-3)",
              color: password && !loading ? "#000" : "var(--text-muted)",
              border: "none",
              padding: "12px",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: password && !loading ? "pointer" : "not-allowed",
              fontFamily: "var(--font-syne)",
            }}
          >
            {loading ? "Checking..." : "Access"}
          </button>
        </form>
      </div>
    </div>
  );
}
