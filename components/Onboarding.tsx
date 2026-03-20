"use client";

import { useState } from "react";

interface Props {
  onStart: (name: string) => void;
}

export default function Onboarding({ onStart }: Props) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Your name is required.");
      return;
    }
    onStart(trimmed);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        animation: "fadeIn 0.4s ease",
      }}
    >
      {/* Grid texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          opacity: 0.6,
          pointerEvents: "none",
        }}
      />

      {/* Radial accent glow */}
      <div
        style={{
          position: "absolute",
          width: "700px",
          height: "700px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(0,255,136,0.05) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "400px",
          padding: "0 28px",
          animation: "scaleIn 0.45s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: "52px", textAlign: "center" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "52px",
              height: "52px",
              border: "1px solid var(--border-2)",
              marginBottom: "22px",
              background: "var(--accent-dim)",
            }}
          >
            <span
              style={{
                color: "var(--accent)",
                fontSize: "22px",
                fontWeight: 800,
                fontFamily: "var(--font-space-mono)",
              }}
            >
              F
            </span>
          </div>

          <div
            style={{
              fontSize: "34px",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 1,
              color: "var(--text)",
            }}
          >
            FitCoach
          </div>

          <div
            style={{
              marginTop: "10px",
              fontSize: "11px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              fontFamily: "var(--font-space-mono)",
            }}
          >
            AI Performance Coach
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <label
            style={{
              display: "block",
              fontSize: "10px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--text-muted)",
              fontFamily: "var(--font-space-mono)",
              marginBottom: "8px",
            }}
          >
            Your Name
          </label>

          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="e.g. Alex"
            autoFocus
            style={{
              display: "block",
              width: "100%",
              background: "var(--surface)",
              border: `1px solid ${
                error ? "#ff4444" : focused ? "var(--accent)" : "var(--border-2)"
              }`,
              color: "var(--text)",
              padding: "14px 16px",
              fontSize: "16px",
              fontFamily: "var(--font-syne)",
              fontWeight: 500,
              outline: "none",
              transition: "border-color 0.15s",
              marginBottom: error ? "6px" : "4px",
            }}
          />

          {error && (
            <div
              style={{
                color: "#ff4444",
                fontSize: "11px",
                fontFamily: "var(--font-space-mono)",
                marginBottom: "4px",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            style={{
              display: "block",
              width: "100%",
              marginTop: "12px",
              background: "var(--accent)",
              color: "#000",
              border: "none",
              padding: "15px 24px",
              fontSize: "13px",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: "pointer",
              fontFamily: "var(--font-syne)",
              transition: "opacity 0.15s",
            }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.opacity = "0.88")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.opacity = "1")
            }
          >
            Start Training &rarr;
          </button>
        </form>

        <div
          style={{
            textAlign: "center",
            marginTop: "28px",
            color: "var(--text-muted)",
            fontSize: "11px",
            fontFamily: "var(--font-space-mono)",
            letterSpacing: "0.04em",
          }}
        >
          Progress saved locally &middot; No account needed
        </div>
      </div>
    </div>
  );
}
