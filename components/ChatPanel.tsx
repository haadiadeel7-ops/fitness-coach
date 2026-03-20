"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { UserData } from "@/lib/storage";

export interface Message {
  id: string;
  role: "user" | "coach";
  content: string;
}

interface Props {
  user: UserData;
  messages: Message[];
  loading: boolean;
  onSend: (content: string) => void;
}

export default function ChatPanel({ user, messages, loading, onSend }: Props) {
  const [input, setInput] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    onSend(trimmed);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const t = e.target;
    t.style.height = "auto";
    t.style.height = Math.min(t.scrollHeight, 144) + "px";
  };

  const canSend = input.trim().length > 0 && !loading;

  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid var(--border)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "60px",
          padding: "0 24px",
          borderBottom: "1px solid var(--border)",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: "var(--accent)",
              animation: "glow 2.5s ease infinite",
            }}
          />
          <span style={{ fontSize: "14px", fontWeight: 700, letterSpacing: "-0.01em" }}>
            FitCoach
          </span>
        </div>

        <span
          style={{
            fontSize: "11px",
            color: "var(--text-muted)",
            fontFamily: "var(--font-space-mono)",
            letterSpacing: "0.08em",
          }}
        >
          {user.name.toUpperCase()}
        </span>
      </div>

      {/* Messages */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "28px 24px",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
        }}
      >
        {messages.length === 0 && (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "14px",
              textAlign: "center",
              animation: "fadeIn 0.5s ease",
            }}
          >
            <div style={{ fontSize: "44px", lineHeight: 1 }}>&#128170;</div>
            <div style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "-0.01em" }}>
              Ready when you are, {user.name.split(" ")[0]}.
            </div>
            <div
              style={{
                fontSize: "13px",
                color: "var(--text-muted)",
                maxWidth: "260px",
                lineHeight: 1.65,
              }}
            >
              Ask about workouts, nutrition, recovery &mdash; anything fitness.
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: "flex",
              flexDirection: msg.role === "user" ? "row-reverse" : "row",
              alignItems: "flex-start",
              gap: "10px",
              animation: "fadeUp 0.25s ease forwards",
            }}
          >
            {msg.role === "coach" && (
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  flexShrink: 0,
                  background: "var(--accent-dim)",
                  border: "1px solid var(--accent-mid)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "10px",
                  fontWeight: 700,
                  color: "var(--accent)",
                  fontFamily: "var(--font-space-mono)",
                  marginTop: "2px",
                }}
              >
                FC
              </div>
            )}

            <div
              className={msg.role === "coach" ? "coach-message" : undefined}
              style={{
                maxWidth: "70%",
                padding: "12px 16px",
                background: msg.role === "user" ? "var(--accent)" : "var(--surface-2)",
                color: msg.role === "user" ? "#000" : "var(--text)",
                fontSize: "14px",
                lineHeight: "1.65",
                fontWeight: msg.role === "user" ? 600 : 400,
                borderLeft: msg.role === "coach" ? "2px solid var(--accent)" : "none",
              }}
            >
              {msg.role === "user" ? (
                msg.content
              ) : (
                <ReactMarkdown
                  components={{
                    p: ({ children }) => (
                      <p style={{ margin: "0 0 10px 0" }}>{children}</p>
                    ),
                    h1: ({ children }) => (
                      <h1 style={{ fontSize: "16px", fontWeight: 800, margin: "14px 0 6px", letterSpacing: "-0.01em" }}>{children}</h1>
                    ),
                    h2: ({ children }) => (
                      <h2 style={{ fontSize: "15px", fontWeight: 700, margin: "14px 0 6px", letterSpacing: "-0.01em" }}>{children}</h2>
                    ),
                    h3: ({ children }) => (
                      <h3 style={{ fontSize: "14px", fontWeight: 700, margin: "12px 0 4px", color: "var(--accent)" }}>{children}</h3>
                    ),
                    strong: ({ children }) => (
                      <strong style={{ fontWeight: 700, color: "var(--accent)" }}>{children}</strong>
                    ),
                    ul: ({ children }) => (
                      <ul style={{ margin: "6px 0 10px 0", paddingLeft: "18px" }}>{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol style={{ margin: "6px 0 10px 0", paddingLeft: "18px" }}>{children}</ol>
                    ),
                    li: ({ children }) => (
                      <li style={{ margin: "4px 0", lineHeight: "1.6" }}>{children}</li>
                    ),
                    hr: () => (
                      <hr style={{ border: "none", borderTop: "1px solid var(--border-2)", margin: "10px 0" }} />
                    ),
                    code: ({ children }) => (
                      <code style={{ background: "var(--surface-3)", padding: "1px 5px", fontSize: "12px", fontFamily: "var(--font-space-mono)" }}>{children}</code>
                    ),
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
              animation: "fadeUp 0.2s ease",
            }}
          >
            <div
              style={{
                width: "28px",
                height: "28px",
                flexShrink: 0,
                background: "var(--accent-dim)",
                border: "1px solid var(--accent-mid)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "10px",
                fontWeight: 700,
                color: "var(--accent)",
                fontFamily: "var(--font-space-mono)",
              }}
            >
              FC
            </div>
            <div
              style={{
                padding: "14px 18px",
                background: "var(--surface-2)",
                borderLeft: "2px solid var(--accent)",
                display: "flex",
                gap: "5px",
                alignItems: "center",
              }}
            >
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  style={{
                    width: "5px",
                    height: "5px",
                    borderRadius: "50%",
                    background: "var(--accent)",
                    animation: `pulse 1.2s ease ${i * 0.22}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div
        style={{
          borderTop: "1px solid var(--border)",
          padding: "16px 24px",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", gap: "10px", alignItems: "flex-end" }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            placeholder="Ask your coach anything..."
            rows={1}
            style={{
              flex: 1,
              background: "var(--surface-2)",
              border: `1px solid ${inputFocused ? "var(--accent)" : "var(--border-2)"}`,
              color: "var(--text)",
              padding: "12px 14px",
              fontSize: "14px",
              fontFamily: "var(--font-syne)",
              resize: "none",
              outline: "none",
              lineHeight: "1.55",
              overflow: "hidden",
              transition: "border-color 0.15s",
            }}
          />

          <button
            onClick={send}
            disabled={!canSend}
            style={{
              flexShrink: 0,
              background: canSend ? "var(--accent)" : "var(--surface-3)",
              color: canSend ? "#000" : "var(--text-muted)",
              border: "none",
              padding: "12px 18px",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              cursor: canSend ? "pointer" : "not-allowed",
              fontFamily: "var(--font-syne)",
              transition: "all 0.15s",
              whiteSpace: "nowrap",
            }}
          >
            Send
          </button>
        </div>

        <div
          style={{
            marginTop: "8px",
            fontSize: "10px",
            color: "var(--text-dim)",
            fontFamily: "var(--font-space-mono)",
          }}
        >
          &uarr; send &middot; shift+&uarr; newline
        </div>
      </div>
    </div>
  );
}
