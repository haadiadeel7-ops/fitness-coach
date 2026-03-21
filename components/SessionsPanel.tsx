"use client";

import { useState, useRef, useEffect } from "react";
import { ChatSession, formatSessionDate } from "@/lib/sessions";

interface Props {
  sessions: ChatSession[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
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
  onRename,
  onClose,
  mobileOpen,
  desktopVisible,
}: Props) {
  return (
    <div
      className={`sessions-panel${mobileOpen ? " open" : ""}${!desktopVisible ? " sessions-hidden" : ""}`}
      style={{ width: "220px", flexShrink: 0, display: "flex", flexDirection: "column", background: "var(--surface)", borderRight: "1px solid var(--border)", overflowY: "auto" }}
    >
      <div style={{ height: "60px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
        <span style={{ fontSize: "10px", letterSpacing: "0.16em", textTransform: "uppercase", color: "var(--text)", fontFamily: "var(--font-space-mono)" }}>Chats</span>
        <button onClick={onClose} style={{ background: "transparent", border: "none", color: "var(--text-dim)", fontSize: "16px", cursor: "pointer", lineHeight: 1, padding: "4px" }}>✕</button>
      </div>

      <div style={{ padding: "12px", flexShrink: 0 }}>
        <button
          onClick={onNew}
          style={{ width: "100%", background: "var(--accent-dim)", border: "1px solid var(--accent-mid)", color: "var(--accent)", padding: "10px 12px", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", fontFamily: "var(--font-syne)", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px", transition: "all 0.15s" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--accent-mid)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "var(--accent-dim)"; }}
        >
          <span style={{ fontSize: "16px", lineHeight: 1 }}>+</span>
          New Chat
        </button>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        {sessions.length === 0 && (
          <div style={{ padding: "24px 16px", textAlign: "center", fontSize: "11px", color: "var(--text-dim)", fontFamily: "var(--font-space-mono)", lineHeight: 1.7 }}>No previous chats</div>
        )}
        {sessions.map((s) => (
          <SessionItem
            key={s.id}
            session={s}
            active={s.id === activeId}
            onSelect={() => onSelect(s.id)}
            onDelete={() => onDelete(s.id)}
            onRename={(title) => onRename(s.id, title)}
          />
        ))}
      </div>
    </div>
  );
}

function SessionItem({ session, active, onSelect, onDelete, onRename }: {
  session: ChatSession;
  active: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onRename: (title: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const title = session.title || "New Chat";

  function startEditing(e: React.MouseEvent) {
    e.stopPropagation();
    setDraft(title);
    setEditing(true);
  }

  function commitRename() {
    const trimmed = draft.trim();
    if (trimmed && trimmed !== title) onRename(trimmed);
    setEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") commitRename();
    if (e.key === "Escape") setEditing(false);
  }

  return (
    <div
      onClick={editing ? undefined : onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ position: "relative", padding: "11px 16px", cursor: editing ? "default" : "pointer", borderLeft: `2px solid ${active ? "var(--accent)" : "transparent"}`, background: active ? "var(--accent-dim)" : hovered ? "var(--surface-2)" : "transparent", transition: "background 0.12s" }}
    >
      {editing ? (
        <input
          ref={inputRef}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commitRename}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
          style={{ width: "100%", background: "var(--surface-3)", border: "1px solid var(--accent-mid)", borderRadius: "4px", color: "var(--text)", fontSize: "12px", fontFamily: "var(--font-syne)", padding: "2px 6px", outline: "none", marginBottom: "4px" }}
        />
      ) : (
        <div style={{ fontSize: "12px", fontWeight: active ? 600 : 400, color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", paddingRight: hovered ? "44px" : "0", transition: "padding 0.1s", marginBottom: "4px" }}>
          {title}
        </div>
      )}

      <div style={{ fontSize: "9px", color: "var(--text-dim)", fontFamily: "var(--font-space-mono)", letterSpacing: "0.06em" }}>
        {formatSessionDate(session.updatedAt)}
      </div>

      {hovered && !editing && (
        <div style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", gap: "2px" }}>
          <button
            onClick={startEditing}
            title="Rename"
            style={{ background: "transparent", border: "none", color: "var(--text-dim)", cursor: "pointer", padding: "3px 4px", lineHeight: 1, display: "flex", alignItems: "center" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-dim)")}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); if (window.confirm("Delete this chat?")) onDelete(); }}
            title="Delete"
            style={{ background: "transparent", border: "none", color: "var(--text-dim)", fontSize: "14px", cursor: "pointer", lineHeight: 1, padding: "2px 4px" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#ff4444")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-dim)")}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
