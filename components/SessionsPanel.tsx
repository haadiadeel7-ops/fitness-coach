"use client";

import { useState } from "react";
import { ChatSession, formatSessionDate } from "@/lib/sessions";

interface Props {
  sessions: ChatSession[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  mobileOpen: boolean;
  desktopVisible: boolean;
}

export default function SessionsPanel({
  sessions,
  activeId,
  onSelect,
  onNew,
  onDelete,
  onClose,
  mobileOpen,
  desktopVisible,
}: Props) {
  return (
    <div
      className={`sessions-panel${mobileOpen ? " open" : ""}${!desktopVisible ? " sessions-hidden" : ""}`}
      style={{
        width: "220px",
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        overflowY: "auto",
      }}
    >
      {/* Header */}
      <div
        style={{
          height: "60px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 16px",
          borderBottom: "1px solid var(--border)",
          flexShrink: 0,
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
          Chats
        </span>
        <button
          onClick={onClose}
          style={{
            background: "transparent",
            border: "none",
            color: "var(--text-muted)",
            fontSize: "16px",
            cursor: "pointer",
            lineHeight: 1,
            padding: "4px",
          }}
        >
          ✕
        </button>
      </div>

      {/* New Chat */}
      <div style={{ padding: "12px", flexShrink: 0 }}>
        <button
          onClick={onNew}
          style={{
            width: "100%",
            background: "var(--accent-dim)",
            border: "1px solid var(--accent-mid)",
            color: "var(--accent)",
            padding: "10px 12px",
            fontSize: "11px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            cursor: "pointer",
            fontFamily: "var(--font-syne)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "7px",
            transition: "all 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--accent-mid)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--accent-dim)";
          }}
        >
          <span style={{ fontSize: "16px", lineHeight: 1 }}>+</span>
          New Chat
        </button>
      </div>

      {/* Session list */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {sessions.length === 0 && (
          <div
            style={{
              padding: "24px 16px",
              textAlign: "center",
              fontSize: "11px",
              color: "var(--text-dim)",
              fontFamily: "var(--font-space-mono)",
              lineHeight: 1.7,
            }}
          >
            No previous chats
          </div>
        )}
        {sessions.map((s) => (
          <SessionItem
            key={s.id}
            session={s}
            active={s.id === activeId}
            onSelect={() => onSelect(s.id)}
            onDelete={() => onDelete(s.id)}
          />
        ))}
      </div>
    </div>
  );
}

function SessionItem({
  session,
  active,
  onSelect,
  onDelete,
}: {
  session: ChatSession;
  active: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const title = session.title || "New Chat";
  const isUntitled = !session.title;

  return (
    <div
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        padding: "11px 16px",
        cursor: "pointer",
        borderLeft: `2px solid ${active ? "var(--accent)" : "transparent"}`,
        background: active
          ? "var(--accent-dim)"
          : hovered
          ? "var(--surface-2)"
          : "transparent",
        transition: "background 0.12s",
      }}
    >
      {/* Title */}
      <div
        style={{
          fontSize: "12px",
          fontWeight: active ? 600 : 400,
          color: isUntitled
            ? "var(--text-dim)"
            : active
            ? "var(--text)"
            : "var(--text-muted)",
          fontStyle: isUntitled ? "italic" : "normal",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          paddingRight: hovered ? "22px" : "0",
          transition: "padding 0.1s",
          marginBottom: "4px",
        }}
      >
        {title}
      </div>

      {/* Date */}
      <div
        style={{
          fontSize: "9px",
          color: "var(--text-dim)",
          fontFamily: "var(--font-space-mono)",
          letterSpacing: "0.06em",
        }}
      >
        {formatSessionDate(session.updatedAt)}
      </div>

      {/* Delete button — visible on hover */}
      {hovered && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          style={{
            position: "absolute",
            right: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "transparent",
            border: "none",
            color: "var(--text-dim)",
            fontSize: "13px",
            cursor: "pointer",
            lineHeight: 1,
            padding: "2px 4px",
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#ff4444")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-dim)")}
        >
          ×
        </button>
      )}
    </div>
  );
}
