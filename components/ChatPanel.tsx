"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { UserData } from "@/lib/storage";
import { Message } from "@/lib/types";

export type { Message };

interface Props {
  user: UserData;
  messages: Message[];
  loading: boolean;
  onSend: (content: string) => void;
  onOpenSidebar: () => void;
  onOpenSessions: () => void;
  sessionsOpen: boolean;
}

function getYouTubeEmbedId(url: string): string | null {
  try {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  } catch { return null; }
}

function processContent(content: string): string {
  return content.replace(
    /\[IMAGE:\s*([^\]]+)\]/gi,
    (_, desc) =>
      `\n![${desc.trim()}](https://image.pollinations.ai/prompt/${encodeURIComponent(
        desc.trim()
      )}?width=700&height=420&nologo=true)\n`
  );
}

function InlineImage({ src, alt }: { src: string; alt: string }) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");

  return (
    <div style={{ margin: "14px 0" }}>
      {status === "loading" && (
        <div
          style={{
            width: "100%",
            maxWidth: "500px",
            aspectRatio: "16/9",
            background: "var(--surface-3)",
            border: "1px solid var(--border-2)",
            borderRadius: "6px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
          }}
        >
          <div style={{ display: "flex", gap: "5px" }}>
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "var(--accent)",
                  animation: `pulse 1.2s ease ${i * 0.22}s infinite`,
                }}
              />
            ))}
          </div>
          <div
            style={{
              fontSize: "10px",
              color: "var(--text-dim)",
              fontFamily: "var(--font-space-mono)",
              letterSpacing: "0.08em",
            }}
          >
            Generating image…
          </div>
        </div>
      )}

      {status === "error" && (
        <div
          style={{
            padding: "12px 16px",
            background: "var(--surface-3)",
            border: "1px solid var(--border-2)",
            borderRadius: "6px",
            fontSize: "11px",
            color: "var(--text-dim)",
            fontFamily: "var(--font-space-mono)",
          }}
        >
          Image unavailable
        </div>
      )}

      <img
        src={src}
        alt={alt}
        style={{
          display: status === "loaded" ? "block" : "none",
          maxWidth: "100%",
          borderRadius: "6px",
          border: "1px solid var(--border-2)",
        }}
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("error")}
      />

      {status === "loaded" && alt && (
        <div
          style={{
            fontSize: "10px",
            color: "var(--text-dim)",
            marginTop: "6px",
            fontFamily: "var(--font-space-mono)",
            letterSpacing: "0.04em",
          }}
        >
          {alt}
        </div>
      )}
    </div>
  );
}

export default function ChatPanel({ user, messages, loading, onSend, onOpenSidebar, onOpenSessions, sessionsOpen }: Props) {
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
      {/* ── Header ── */}
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
          <button
            onClick={onOpenSessions}
            title={sessionsOpen ? "Hide chats" : "Show chats"}
            style={{
              background: sessionsOpen ? "var(--surface-3)" : "transparent",
              border: "1px solid var(--border)",
              color: sessionsOpen ? "var(--text)" : "var(--text-muted)",
              width: "30px",
              height: "30px",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              flexShrink: 0,
              transition: "all 0.15s",
            }}
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: i === 1 ? "10px" : "14px",
                  height: "1.5px",
                  background: "currentColor",
                  transition: "width 0.2s",
                }}
              />
            ))}
          </button>

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

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
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
          <button
            className="mobile-stats-btn"
            onClick={onOpenSidebar}
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--border-2)",
              color: "var(--accent)",
              padding: "6px 12px",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              cursor: "pointer",
              fontFamily: "var(--font-syne)",
            }}
          >
            Stats
          </button>
        </div>
      </div>

      {/* ── Messages ── */}
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
              gap: "24px",
              textAlign: "center",
              animation: "fadeIn 0.5s ease",
            }}
          >
            <div>
              <div style={{ fontSize: "44px", lineHeight: 1, marginBottom: "14px" }}>💪</div>
              <div style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "-0.01em", marginBottom: "8px" }}>
                Ready when you are, {user.name.split(" ")[0]}.
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "var(--text-muted)",
                  maxWidth: "260px",
                  lineHeight: 1.65,
                  margin: "0 auto",
                }}
              >
                Ask about workouts, nutrition, recovery — anything fitness.
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
                width: "100%",
                maxWidth: "480px",
              }}
            >
              {[
                { label: "Build a workout plan", prompt: "Build me a 4-day workout plan to gain muscle" },
                { label: "Calculate my TDEE", prompt: "Calculate my TDEE and daily calorie target" },
                { label: "Best exercises for abs", prompt: "What are the best exercises for building abs?" },
                { label: "How much protein?", prompt: "How much protein should I eat per day to build muscle?" },
                { label: "Fix my squat form", prompt: "Give me tips to improve my squat form and depth" },
                { label: "Lose fat, keep muscle", prompt: "How do I lose body fat without losing muscle mass?" },
              ].map(({ label, prompt }) => (
                <button
                  key={label}
                  onClick={() => onSend(prompt)}
                  style={{
                    background: "var(--surface-2)",
                    border: "1px solid var(--border-2)",
                    color: "var(--text)",
                    padding: "10px 14px",
                    fontSize: "12px",
                    fontFamily: "var(--font-syne)",
                    cursor: "pointer",
                    textAlign: "left",
                    lineHeight: 1.4,
                    transition: "border-color 0.15s, background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "var(--accent-mid)";
                    e.currentTarget.style.background = "var(--accent-dim)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "var(--border-2)";
                    e.currentTarget.style.background = "var(--surface-2)";
                  }}
                >
                  {label}
                </button>
              ))}
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
                    p: ({ children }) => <p style={{ margin: "0 0 10px 0" }}>{children}</p>,
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
                    a: ({ href, children }) => {
                      if (!href) return <>{children}</>;
                      const ytId = getYouTubeEmbedId(href);
                      if (ytId) {
                        return (
                          <div style={{ margin: "12px 0", borderRadius: "6px", overflow: "hidden", border: "1px solid var(--border-2)" }}>
                            <iframe
                              width="100%"
                              style={{ aspectRatio: "16/9", border: "none", display: "block" }}
                              src={`https://www.youtube.com/embed/${ytId}`}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        );
                      }
                      const isYtSearch = href.includes("youtube.com/results");
                      return (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: "var(--accent)",
                            textDecoration: "underline",
                            textDecorationColor: "rgba(0,255,136,0.4)",
                            display: isYtSearch ? "inline-flex" : "inline",
                            alignItems: "center",
                            gap: "5px",
                          }}
                        >
                          {isYtSearch && (
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                              <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z"/>
                            </svg>
                          )}
                          {children}
                        </a>
                      );
                    },
                    img: ({ src, alt }) => (
                      <InlineImage src={src || ""} alt={alt || ""} />
                    ),
                  }}
                >
                  {processContent(msg.content)}
                </ReactMarkdown>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", animation: "fadeUp 0.2s ease" }}>
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

      {/* ── Input ── */}
      <div style={{ borderTop: "1px solid var(--border)", padding: "16px 24px", flexShrink: 0 }}>
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
          ↵ send · shift+↵ newline
        </div>
      </div>
    </div>
  );
}
