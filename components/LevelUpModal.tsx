"use client";

import { useEffect } from "react";
import confetti from "canvas-confetti";

interface Props {
  levelName: string;
  onClose: () => void;
}

export default function LevelUpModal({ levelName, onClose }: Props) {
  useEffect(() => {
    confetti({
      particleCount: 180,
      spread: 90,
      origin: { y: 0.6 },
      colors: ["#00ff88", "#ffffff", "#00cc6a", "#88ffcc", "#00ffaa"],
      disableForReducedMotion: true,
    });

    const t = setTimeout(onClose, 4500);
    return () => clearTimeout(t);
  }, [onClose]);

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
          padding: "52px 60px",
          textAlign: "center",
          animation: "scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
          cursor: "default",
          maxWidth: "380px",
          width: "90%",
        }}
      >
        <div
          style={{
            fontSize: "10px",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "var(--accent)",
            fontFamily: "var(--font-space-mono)",
            marginBottom: "18px",
          }}
        >
          &uarr; Level Up
        </div>

        <div
          style={{
            fontSize: "34px",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            marginBottom: "10px",
          }}
        >
          {levelName}
        </div>

        <div style={{ fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.6 }}>
          You&apos;ve unlocked a new rank.
          <br />
          Keep going.
        </div>

        <button
          onClick={onClose}
          style={{
            marginTop: "36px",
            background: "var(--accent)",
            color: "#000",
            border: "none",
            padding: "11px 32px",
            fontSize: "12px",
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
          Let&apos;s Go
        </button>
      </div>
    </div>
  );
}
