"use client";

import { useState } from "react";
import { UserData } from "@/lib/storage";
import { getLevelForMessages, getProgress, LEVELS } from "@/lib/levels";
import { getTipOfTheDay } from "@/lib/tips";

interface Props {
  user: UserData;
  onShare: () => void;
}

const ROMAN = ["I", "II", "III", "IV", "V", "VI"];

export default function Sidebar({ user, onShare }: Props) {
  const level = getLevelForMessages(user.messageCount);
  const progress = getProgress(user.messageCount);
  const tip = getTipOfTheDay();
  const isMaxLevel = !progress.nextLevel;

  return (
    <div
      style={{
        width: "300px",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        background: "var(--surface)",
        overflowY: "auto",
      }}
    >
      {/* Header */}
      <div
        style={{
          height: "60px",
          display: "flex",
          alignItems: "center",
          padding: "0 20px",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <span
          style={{
            fontSize: "10px",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            fontFamily: "var(--font-space-mono)",
          }}
        >
          Performance
        </span>
      </div>

      {/* Level */}
      <div style={{ padding: "22px 20px", borderBottom: "1px solid var(--border)" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: "18px",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "10px",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                fontFamily: "var(--font-space-mono)",
                marginBottom: "6px",
              }}
            >
              Current Level
            </div>
            <div
              style={{
                fontSize: "21px",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
              }}
            >
              {level.name}
            </div>
          </div>

          <div
            style={{
              width: "44px",
              height: "44px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: isMaxLevel ? "var(--accent)" : "var(--accent-dim)",
              border: `1px solid ${isMaxLevel ? "var(--accent)" : "var(--accent-mid)"}`,
              fontSize: "13px",
              fontWeight: 700,
              color: isMaxLevel ? "#000" : "var(--accent)",
              fontFamily: "var(--font-space-mono)",
              flexShrink: 0,
            }}
          >
            {ROMAN[level.level - 1]}
          </div>
        </div>

        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: "10px",
              fontFamily: "var(--font-space-mono)",
              color: "var(--text-muted)",
              marginBottom: "7px",
            }}
          >
            <span>{user.messageCount} msgs</span>
            {progress.nextLevel ? (
              <span>
                {progress.total - progress.current} to {progress.nextLevel.name}
              </span>
            ) : (
              <span style={{ color: "var(--accent)" }}>MAX LEVEL</span>
            )}
          </div>

          <div style={{ height: "2px", background: "var(--border-2)", overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${progress.pct}%`,
                background: "var(--accent)",
                boxShadow: "0 0 8px rgba(0,255,136,0.6)",
                transition: "width 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "5px", marginTop: "14px" }}>
          {LEVELS.map((l) => (
            <div
              key={l.level}
              title={l.name}
              style={{
                flex: 1,
                height: "2px",
                background: l.level <= level.level ? "var(--accent)" : "var(--border-2)",
                transition: "background 0.4s",
              }}
            />
          ))}
        </div>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          borderBottom: "1px solid var(--border)",
        }}
      >
        {[
          { label: "Messages", value: String(user.messageCount), suffix: "" },
          { label: "Day Streak", value: String(user.streak), suffix: "\uD83D\uDD25" },
        ].map((stat, idx) => (
          <div
            key={stat.label}
            style={{
              padding: "18px 20px",
              borderRight: idx === 0 ? "1px solid var(--border)" : "none",
            }}
          >
            <div
              style={{
                fontSize: "10px",
                letterSpacing: "0.13em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                fontFamily: "var(--font-space-mono)",
                marginBottom: "8px",
              }}
            >
              {stat.label}
            </div>
            <div
              style={{
                fontSize: "30px",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                lineHeight: 1,
                fontFamily: "var(--font-space-mono)",
              }}
            >
              {stat.value}
              {stat.suffix && <span style={{ fontSize: "18px" }}>{stat.suffix}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Tip of the Day */}
      <div style={{ padding: "20px", borderBottom: "1px solid var(--border)", flex: 1 }}>
        <div
          style={{
            fontSize: "10px",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            fontFamily: "var(--font-space-mono)",
            marginBottom: "12px",
          }}
        >
          Coach&apos;s Tip
        </div>
        <div
          style={{
            fontSize: "13px",
            lineHeight: "1.7",
            color: "var(--text)",
            paddingLeft: "12px",
            borderLeft: "2px solid var(--accent)",
            fontStyle: "italic",
          }}
        >
          &ldquo;{tip}&rdquo;
        </div>
      </div>

      {/* Share */}
      <div style={{ padding: "20px" }}>
        <ShareButton onClick={onShare} />
      </div>
    </div>
  );
}

function ShareButton({ onClick }: { onClick: () => void }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: "100%",
        background: "transparent",
        border: `1px solid ${hovered ? "var(--accent)" : "var(--border-2)"}`,
        color: hovered ? "var(--accent)" : "var(--text)",
        padding: "12px",
        fontSize: "11px",
        fontWeight: 600,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        cursor: "pointer",
        fontFamily: "var(--font-syne)",
        transition: "all 0.15s",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
      }}
    >
      <span style={{ fontSize: "14px" }}>&nearr;</span>
      Share My Level
    </button>
  );
}
