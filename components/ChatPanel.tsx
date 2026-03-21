"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { UserData } from "@/lib/storage";
import { Message } from "@/lib/types";
import { useTheme } from "@/components/ThemeProvider";

export type { Message };

interface Props {
  user: UserData;
  messages: Message[];
  loading: boolean;
  onSend: (content: string) => void;
  onOpenSidebar: () => void;
  onOpenSessions: () => void;
  sessionsOpen: boolean;
  isGuest?: boolean;
  guestMessagesLeft?: number;
}

function getYouTubeEmbedId(url: string): string | null {
  try {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  } catch { return null; }
}

function checkExportable(content: string): { exportable: boolean; clean: string } {
  const trimmed = content.trimStart();
  if (trimmed.startsWith('[EXPORTABLE]')) {
    return { exportable: true, clean: trimmed.replace(/^\[EXPORTABLE\]\s*/i, '') };
  }
  return { exportable: false, clean: content };
}

function processContent(content: string, isGuest?: boolean): string {
  if (isGuest) {
    return content.replace(/\[IMAGE:\s*([^\]]+)\]/gi, '\n*Sign up to unlock AI-generated images*\n');
  }
  return content.replace(
    /\[IMAGE:\s*([^\]]+)\]/gi,
    (_, desc) => `\n![${desc.trim()}](/api/generate-image?prompt=${encodeURIComponent(desc.trim())})\n`
  );
}

function markdownToHtml(md: string): string {
  let text = md
    .replace(/^\[EXPORTABLE\]\s*/i, '')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
    .replace(/\[IMAGE:[^\]]+\]/gi, '');

  text = text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  const lines = text.split('\n');
  const out: string[] = [];
  let inUl = false;
  let inOl = false;

  for (const raw of lines) {
    const line = raw.trimEnd();
    const h3 = line.match(/^### (.+)$/);
    const h2 = line.match(/^## (.+)$/);
    const h1 = line.match(/^# (.+)$/);
    const ul = line.match(/^[-*] (.+)$/);
    const ol = line.match(/^\d+\.\s+(.+)$/);
    const hr = line === '---';

    if (h1 || h2 || h3 || hr) {
      if (inUl) { out.push('</ul>'); inUl = false; }
      if (inOl) { out.push('</ol>'); inOl = false; }
      if (h3) out.push(`<h3>${h3[1]}</h3>`);
      else if (h2) out.push(`<h2>${h2[1]}</h2>`);
      else if (h1) out.push(`<h1>${h1[1]}</h1>`);
      else out.push('<hr>');
    } else if (ul) {
      if (inOl) { out.push('</ol>'); inOl = false; }
      if (!inUl) { out.push('<ul>'); inUl = true; }
      out.push(`<li>${ul[1]}</li>`);
    } else if (ol) {
      if (inUl) { out.push('</ul>'); inUl = false; }
      if (!inOl) { out.push('<ol>'); inOl = true; }
      out.push(`<li>${ol[1]}</li>`);
    } else {
      if (inUl) { out.push('</ul>'); inUl = false; }
      if (inOl) { out.push('</ol>'); inOl = false; }
      if (line.trim()) out.push(`<p>${line}</p>`);
    }
  }
  if (inUl) out.push('</ul>');
  if (inOl) out.push('</ol>');
  return out.join('\n');
}

function exportAsPDF(content: string, userName: string) {
  const html = markdownToHtml(content);
  const date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  const win = window.open('', '_blank', 'width=860,height=1000');
  if (!win) return;
  win.document.write(`<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<title>FitCoach Plan</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #111; background: #fff; padding: 52px 56px; max-width: 760px; margin: 0 auto; }
  .header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 3px solid #16a34a; padding-bottom: 18px; margin-bottom: 32px; }
  .brand { font-size: 24px; font-weight: 900; color: #16a34a; letter-spacing: -0.03em; }
  .meta { font-size: 11px; color: #888; text-align: right; line-height: 1.7; }
  h1 { font-size: 22px; font-weight: 800; margin: 20px 0 8px; }
  h2 { font-size: 16px; font-weight: 700; color: #16a34a; margin: 24px 0 8px; padding-bottom: 5px; border-bottom: 1px solid #dcfce7; }
  h3 { font-size: 14px; font-weight: 700; color: #111; margin: 18px 0 6px; }
  p { font-size: 13px; line-height: 1.8; color: #333; margin: 6px 0; }
  ul, ol { margin: 8px 0 14px 22px; }
  li { font-size: 13px; line-height: 1.8; color: #333; margin: 3px 0; }
  strong { font-weight: 700; color: #111; }
  em { font-style: italic; color: #555; }
  hr { border: none; border-top: 1px solid #e5e7eb; margin: 18px 0; }
  .footer { margin-top: 52px; padding-top: 16px; border-top: 1px solid #e5e7eb; display: flex; justify-content: space-between; font-size: 10px; color: #bbb; }
  .save-btn { position: fixed; bottom: 24px; right: 24px; background: #16a34a; color: #fff; border: none; padding: 12px 24px; font-size: 13px; font-weight: 700; cursor: pointer; border-radius: 6px; font-family: inherit; box-shadow: 0 4px 12px rgba(22,163,74,0.35); }
  .save-btn:hover { background: #15803d; }
  @media print { .save-btn { display: none; } body { padding: 24px 28px; } }
</style>
</head>
<body>
<button class="save-btn" onclick="window.print()">Save as PDF</button>
<div class="header">
  <div class="brand">FitCoach</div>
  <div class="meta"><div>For <strong>${userName}</strong></div><div>${date}</div></div>
</div>
<div class="content">${html}</div>
<div class="footer">
  <span>Generated by FitCoach AI</span>
  <span>Not medical advice &mdash; consult a healthcare professional</span>
</div>
</body></html>`);
  win.document.close();
}

function InlineImage({ src, alt }: { src: string; alt: string }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');

  useEffect(() => {
    if (!src) { setStatus('error'); return; }
    if (src.startsWith('/api/generate-image')) {
      fetch(src)
        .then((r) => r.json())
        .then((data) => { if (data.url) setImageUrl(data.url); else setStatus('error'); })
        .catch(() => setStatus('error'));
    } else {
      setImageUrl(src);
    }
  }, [src]);

  return (
    <div style={{ margin: '14px 0' }}>
      {status !== 'error' && !imageUrl && (
        <div style={{ width: '100%', maxWidth: '500px', aspectRatio: '16/9', background: 'var(--surface-3)', border: '1px solid var(--border-2)', borderRadius: '6px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '5px' }}>
            {[0, 1, 2].map((i) => <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', animation: `pulse 1.2s ease ${i * 0.22}s infinite` }} />)}
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'var(--font-space-mono)', letterSpacing: '0.08em' }}>Generating image...</div>
        </div>
      )}
      {status === 'error' && (
        <div style={{ padding: '12px 16px', background: 'var(--surface-3)', border: '1px solid var(--border-2)', borderRadius: '6px', fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-space-mono)' }}>Image unavailable</div>
      )}
      {imageUrl && (
        <>
          <img src={imageUrl} alt={alt} style={{ display: status === 'loaded' ? 'block' : 'none', maxWidth: '100%', borderRadius: '6px', border: '1px solid var(--border-2)' }} onLoad={() => setStatus('loaded')} onError={() => setStatus('error')} />
          {status !== 'loaded' && (
            <div style={{ width: '100%', maxWidth: '500px', aspectRatio: '1/1', background: 'var(--surface-3)', border: '1px solid var(--border-2)', borderRadius: '6px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '5px' }}>
                {[0, 1, 2].map((i) => <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', animation: `pulse 1.2s ease ${i * 0.22}s infinite` }} />)}
              </div>
              <div style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'var(--font-space-mono)', letterSpacing: '0.08em' }}>Loading image...</div>
            </div>
          )}
          {status === 'loaded' && alt && (
            <div style={{ fontSize: '10px', color: 'var(--text-dim)', marginTop: '6px', fontFamily: 'var(--font-space-mono)', letterSpacing: '0.04em' }}>{alt}</div>
          )}
        </>
      )}
    </div>
  );
}

export default function ChatPanel({ user, messages, loading, onSend, onOpenSidebar, onOpenSessions, sessionsOpen, isGuest, guestMessagesLeft }: Props) {
  const { theme, toggle } = useTheme();
  const [input, setInput] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const [dismissedExports, setDismissedExports] = useState<Set<string>>(new Set());
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    onSend(trimmed);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const t = e.target;
    t.style.height = 'auto';
    t.style.height = Math.min(t.scrollHeight, 144) + 'px';
  };

  const atGuestLimit = isGuest && (guestMessagesLeft ?? 1) <= 0;
  const canSend = input.trim().length > 0 && !loading && !atGuestLimit;

  return (
    <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border)' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px', padding: '0 24px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={onOpenSessions}
            title={sessionsOpen ? 'Hide chats' : 'Show chats'}
            style={{ background: sessionsOpen ? 'var(--surface-3)' : 'transparent', border: '1px solid var(--border)', color: sessionsOpen ? 'var(--text)' : 'var(--text-muted)', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', flexShrink: 0, transition: 'all 0.15s' }}
          >
            {[0, 1, 2].map((i) => (
              <div key={i} style={{ width: i === 1 ? '10px' : '14px', height: '1.5px', background: 'currentColor', transition: 'width 0.2s' }} />
            ))}
          </button>
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--accent)', animation: 'glow 2.5s ease infinite' }} />
          <span style={{ fontSize: '14px', fontWeight: 700, letterSpacing: '-0.01em' }}>FitCoach</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-space-mono)', letterSpacing: '0.08em' }}>
            {isGuest ? 'GUEST' : user.name.toUpperCase()}
          </span>

          {/* Theme toggle */}
          <button
            onClick={toggle}
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            style={{ background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.15s', borderRadius: '0' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent-mid)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            {theme === 'light' ? (
              /* Moon — click to go dark */
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            ) : (
              /* Sun — click to go light */
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            )}
          </button>

          <button className="mobile-stats-btn" onClick={onOpenSidebar} style={{ background: 'var(--surface-2)', border: '1px solid var(--border-2)', color: 'var(--accent)', padding: '6px 12px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'var(--font-syne)' }}>Stats</button>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {messages.length === 0 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '24px', textAlign: 'center', animation: 'fadeIn 0.5s ease' }}>
            <div>
              <div style={{ fontSize: '44px', lineHeight: 1, marginBottom: '14px' }}>&#x1F4AA;</div>
              <div style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '-0.01em', marginBottom: '8px' }}>
                Ready when you are{isGuest ? '' : `, ${user.name.split(' ')[0]}`}.
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', maxWidth: '260px', lineHeight: 1.65, margin: '0 auto' }}>
                Ask about workouts, nutrition, recovery and anything fitness.
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', width: '100%', maxWidth: '480px' }}>
              {[
                { label: 'Build a workout plan', prompt: 'Build me a 4-day workout plan to gain muscle' },
                { label: 'Calculate my TDEE', prompt: 'Calculate my TDEE and daily calorie target' },
                { label: 'Best exercises for abs', prompt: 'What are the best exercises for building abs?' },
                { label: 'How much protein?', prompt: 'How much protein should I eat per day to build muscle?' },
                { label: 'Fix my squat form', prompt: 'Give me tips to improve my squat form and depth' },
                { label: 'Lose fat, keep muscle', prompt: 'How do I lose body fat without losing muscle mass?' },
              ].map(({ label, prompt }) => (
                <button
                  key={label}
                  onClick={() => onSend(prompt)}
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border-2)', color: 'var(--text)', padding: '10px 14px', fontSize: '12px', fontFamily: 'var(--font-syne)', cursor: 'pointer', textAlign: 'left', lineHeight: 1.4, transition: 'border-color 0.15s, background 0.15s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-mid)'; e.currentTarget.style.background = 'var(--accent-dim)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-2)'; e.currentTarget.style.background = 'var(--surface-2)'; }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => {
          const { exportable, clean } = msg.role === 'coach' ? checkExportable(msg.content) : { exportable: false, clean: msg.content };
          const showExport = exportable && !dismissedExports.has(msg.id);

          return (
            <div key={msg.id}>
              <div style={{ display: 'flex', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start', gap: '10px', animation: 'fadeUp 0.25s ease forwards' }}>
                {msg.role === 'coach' && (
                  <div style={{ width: '28px', height: '28px', flexShrink: 0, background: 'var(--accent-dim)', border: '1px solid var(--accent-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-space-mono)', marginTop: '2px' }}>FC</div>
                )}
                <div
                  className={msg.role === 'coach' ? 'coach-message' : undefined}
                  style={{ maxWidth: '70%', padding: '12px 16px', background: msg.role === 'user' ? 'var(--accent)' : 'var(--surface-2)', color: msg.role === 'user' ? 'var(--accent-fg)' : 'var(--text)', fontSize: '14px', lineHeight: '1.65', fontWeight: msg.role === 'user' ? 600 : 400, borderLeft: msg.role === 'coach' ? '2px solid var(--accent)' : 'none' }}
                >
                  {msg.role === 'user' ? (
                    msg.content
                  ) : (
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p style={{ margin: '0 0 10px 0' }}>{children}</p>,
                        h1: ({ children }) => <h1 style={{ fontSize: '16px', fontWeight: 800, margin: '14px 0 6px', letterSpacing: '-0.01em' }}>{children}</h1>,
                        h2: ({ children }) => <h2 style={{ fontSize: '15px', fontWeight: 700, margin: '14px 0 6px', letterSpacing: '-0.01em' }}>{children}</h2>,
                        h3: ({ children }) => <h3 style={{ fontSize: '14px', fontWeight: 700, margin: '12px 0 4px', color: 'var(--accent)' }}>{children}</h3>,
                        strong: ({ children }) => <strong style={{ fontWeight: 700, color: 'var(--accent)' }}>{children}</strong>,
                        ul: ({ children }) => <ul style={{ margin: '6px 0 10px 0', paddingLeft: '18px' }}>{children}</ul>,
                        ol: ({ children }) => <ol style={{ margin: '6px 0 10px 0', paddingLeft: '18px' }}>{children}</ol>,
                        li: ({ children }) => <li style={{ margin: '4px 0', lineHeight: '1.6' }}>{children}</li>,
                        hr: () => <hr style={{ border: 'none', borderTop: '1px solid var(--border-2)', margin: '10px 0' }} />,
                        code: ({ children }) => <code style={{ background: 'var(--surface-3)', padding: '1px 5px', fontSize: '12px', fontFamily: 'var(--font-space-mono)' }}>{children}</code>,
                        a: ({ href, children }) => {
                          if (!href) return <>{children}</>;
                          const ytId = getYouTubeEmbedId(href);
                          if (ytId) {
                            return (
                              <div style={{ margin: '12px 0', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-2)' }}>
                                <iframe width="100%" style={{ aspectRatio: '16/9', border: 'none', display: 'block' }} src={`https://www.youtube.com/embed/${ytId}`} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                              </div>
                            );
                          }
                          const isYtSearch = href.includes('youtube.com/results');
                          return (
                            <a href={href} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline', textDecorationColor: 'rgba(22,163,74,0.4)', display: isYtSearch ? 'inline-flex' : 'inline', alignItems: 'center', gap: '5px' }}>
                              {isYtSearch && (
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
                                  <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.6 31.6 0 0 0 0 12a31.6 31.6 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.6 31.6 0 0 0 24 12a31.6 31.6 0 0 0-.5-5.8zM9.7 15.5V8.5l6.3 3.5-6.3 3.5z"/>
                                </svg>
                              )}
                              {children}
                            </a>
                          );
                        },
                        img: ({ src, alt }) => <InlineImage src={typeof src === 'string' ? src : ''} alt={alt || ''} />,
                      }}
                    >
                      {processContent(clean, isGuest)}
                    </ReactMarkdown>
                  )}
                </div>
              </div>

              {/* PDF export offer */}
              {showExport && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '8px', marginLeft: '38px', animation: 'fadeUp 0.3s ease forwards' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--surface-2)', border: '1px solid var(--accent-mid)', padding: '10px 14px', flex: '0 0 auto' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                      <line x1="12" y1="18" x2="12" y2="12"/>
                      <line x1="9" y1="15" x2="15" y2="15"/>
                    </svg>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-space-mono)', letterSpacing: '0.04em' }}>Save this plan?</span>
                    <button
                      onClick={() => exportAsPDF(clean, user.name)}
                      style={{ background: 'var(--accent)', color: 'var(--accent-fg)', border: 'none', padding: '5px 12px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'var(--font-syne)' }}
                    >
                      Download PDF
                    </button>
                    <button
                      onClick={() => setDismissedExports((prev) => new Set(prev).add(msg.id))}
                      style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', fontSize: '14px', cursor: 'pointer', lineHeight: 1, padding: '2px 4px' }}
                      title="Dismiss"
                    >&#x2715;</button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', animation: 'fadeUp 0.2s ease' }}>
            <div style={{ width: '28px', height: '28px', flexShrink: 0, background: 'var(--accent-dim)', border: '1px solid var(--accent-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--font-space-mono)' }}>FC</div>
            <div style={{ padding: '14px 18px', background: 'var(--surface-2)', borderLeft: '2px solid var(--accent)', display: 'flex', gap: '5px', alignItems: 'center' }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--accent)', animation: `pulse 1.2s ease ${i * 0.22}s infinite` }} />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Guest banner */}
      {isGuest && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '8px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: atGuestLimit ? 'rgba(255,100,100,0.06)' : 'var(--surface)', flexShrink: 0 }}>
          <span style={{ fontSize: '10px', fontFamily: 'var(--font-space-mono)', color: atGuestLimit ? '#ff6b6b' : (guestMessagesLeft ?? 0) <= 2 ? '#ffaa44' : 'var(--text-dim)', letterSpacing: '0.06em' }}>
            {atGuestLimit ? 'Daily limit reached' : `${guestMessagesLeft} / 7 messages remaining today`}
          </span>
          <a href="/auth" style={{ fontSize: '10px', fontFamily: 'var(--font-space-mono)', color: 'var(--accent)', textDecoration: 'underline', textDecorationColor: 'rgba(22,163,74,0.35)', letterSpacing: '0.06em' }}>Sign up for unlimited</a>
        </div>
      )}

      {/* Input */}
      <div style={{ borderTop: '1px solid var(--border)', padding: '16px 24px', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            placeholder={atGuestLimit ? 'Daily limit reached - sign up for unlimited' : 'Ask your coach anything...'}
            rows={1}
            disabled={atGuestLimit}
            style={{ flex: 1, background: 'var(--surface-2)', border: `1px solid ${inputFocused ? 'var(--accent)' : 'var(--border-2)'}`, color: atGuestLimit ? 'var(--text-dim)' : 'var(--text)', padding: '12px 14px', fontSize: '14px', fontFamily: 'var(--font-syne)', resize: 'none', outline: 'none', lineHeight: '1.55', overflow: 'hidden', transition: 'border-color 0.15s', cursor: atGuestLimit ? 'not-allowed' : 'text' }}
          />
          <button
            onClick={send}
            disabled={!canSend}
            style={{ flexShrink: 0, background: canSend ? 'var(--accent)' : 'var(--surface-3)', color: canSend ? 'var(--accent-fg)' : 'var(--text-muted)', border: 'none', padding: '12px 18px', fontSize: '12px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', cursor: canSend ? 'pointer' : 'not-allowed', fontFamily: 'var(--font-syne)', transition: 'all 0.15s', whiteSpace: 'nowrap' }}
          >
            Send
          </button>
        </div>
        <div style={{ marginTop: '8px', fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'var(--font-space-mono)' }}>
          {isGuest ? 'Guest mode - sign up for unlimited messages + image generation' : 'Enter to send  /  Shift+Enter for newline'}
        </div>
      </div>
    </div>
  );
}
