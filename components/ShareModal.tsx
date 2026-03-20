"use client";

import { useState } from "react";
import { UserData } from "@/lib/storage";
import { getLevelForMessages, LEVELS } from "@/lib/levels";

interface Props {
  user: UserData;
  onClose: () => void;
}

const ROMAN = ["I", "II", "III", "IV", "V", "VI"];

export default function ShareModal({ user, onClose }: Props) {
  const [copied, setCopied] = useState(false);
  const level = getLevelForMessages(user.messageCount);

  const shareText = [
    `\uD83C\uDFCB\uFE0F I'm a "${level.name}" on FitCoach!`,
    `\uD83D\uDCAC ${user.messageCount} coaching sessions`,
    `\uD83D\uDD25 ${user.streak}-day streak`,
    ``,
    `Train smarter with your AI fitness coach \u2192`,
  ].join("\n");

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Clipboard API unavailable
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.82)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
        animation: "fadeIn 0.2s ease",
        cursor: "pointer",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border-2)",
          width: "340px",
          animation: "scaleIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
          cursor: "default",
        }}
      >
        {/* Card Preview */}
        <div
          style={{
            margin: "20px",
            padding: "28px 24px",
            background: "var(--bg)",
            border: "1px solid var(--border-2)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
              opacity: 0.5,
              pointerEvents: "none",
            }}
          />

          <div style={{ position: "relative" }}>
            <div
              style={{
                fontSize: "9px",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                fontFamily: "var(--font-space-mono)",
                marginBottom: "18px",
              }}
            >
              FitCoach
            </div>

            <div
              style={{
                fontSize: "10px",
                color: "var(--text-muted)",
                fontFamily: "var(--font-space-mono)",
                letterSpacing: "0.08em",
                marginBottom: "4px",
              }}
            >
              {user.name.toUpperCase()}
            </div>

            <div
              style={{
                fontSize: "26px",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                marginBottom: "6px",
              }}
            >
              {level.name}
            </div>

            <div style={{ display: "flex", gap: "4px", marginBottom: "22px" }}>
              {LEVELS.map((l) => (
                <div
                  key={l.level}
                  style={{
                    flex: 1,
                    height: "2px",
                    background:
                      l.level <= level.level ? "var(--accent)" : "var(--border-2)",
                  }}
                />
              ))}
            </div>

            <div style={{ display: "flex", gap: "28px" }}>
              {[
                { label: "SESSIONS", value: String(user.messageCount) },
                { label: "STREAK", value: `${user.streak}\uD83D\uDD25` },
                { label: "RANK", value: ROMAN[level.level - 1] },
              ].map((s) => (
                <div key={s.label}>
                  <div
                    style={{
                      fontSize: "9px",
                      color: "var(--text-muted)",
                      fontFamily: "var(--font-space-mono)",
                      letterSpacing: "0.1em",
                      marginBottom: "4px",
                    }}
                  >
                    {s.label}
                  </div>
                  <div
                    style={{
                      fontSize: "20px",
                      fontWeight: 700,
                      fontFamily: "var(--font-space-mono)",
                      color: "var(--accent)",
                    }}
                  >
                    {s.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ padding: "0 20px 20px" }}>
          <button
            onClick={handleCopy}
            style={{
              display: "block",
              width: "100%",
              background: copied ? "var(--surface-3)" : "var(--accent)",
              color: copied ? "var(--text-muted)" : "#000",
              border: "none",
              padding: "13px",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: "pointer",
              fontFamily: "var(--font-syne)",
              transition: "all 0.15s",
              marginBottom: "10px",
            }}
          >
            {copied ? "\u2713 Copied!" : "Copy to Clipboard"}
          </button>

          <button
            onClick={onClose}
            style={{
              display: "block",
              width: "100%",
              background: "transparent",
              border: "1px solid var(--border-2)",
              color: "var(--text-muted)",
              padding: "11px",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: "pointer",
              fontFamily: "var(--font-syne)",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
