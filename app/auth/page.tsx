"use client";

import { useState, useEffect, useRef } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// ─── SVG Icons ────────────────────────────────────────────────────────────────

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="10" height="10" fill="#F25022" />
      <rect x="11" y="0" width="10" height="10" fill="#00A4EF" />
      <rect x="0" y="11" width="10" height="10" fill="#7FBA00" />
      <rect x="11" y="11" width="10" height="10" fill="#FFB900" />
    </svg>
  );
}

function EnvelopeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M2 7l10 7 10-7" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 0.8s linear infinite" }}>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

function ChevronDown({ flipped }: { flipped: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "transform 0.3s ease", transform: flipped ? "rotate(180deg)" : "rotate(0deg)" }}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

type EmailMode = "signin" | "signup";
type LoadingState = "idle" | "google" | "microsoft" | "email";

export default function AuthPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [emailOpen, setEmailOpen] = useState(false);
  const [emailMode, setEmailMode] = useState<EmailMode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState<LoadingState>("idle");

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/");
    }
  }, [status, router]);

  function handleModeToggle() {
    setEmailMode((prev) => (prev === "signin" ? "signup" : "signin"));
    setError("");
    setName("");
    setPassword("");
  }

  function handleEmailToggle() {
    setEmailOpen((prev) => !prev);
    setError("");
  }

  async function handleGoogleSignIn() {
    setLoading("google");
    await signIn("google", { callbackUrl: "/" });
  }

  async function handleMicrosoftSignIn() {
    setLoading("microsoft");
    await signIn("microsoft-entra-id", { callbackUrl: "/" });
  }

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading("email");

    try {
      if (emailMode === "signup") {
        const regRes = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        });
        const regData = await regRes.json();
        if (!regRes.ok || !regData.success) {
          setError(regData.error || "Registration failed. Please try again.");
          setLoading("idle");
          return;
        }
      }

      const result = await signIn("credentials", {
        email,
        password,
        callbackUrl: "/",
        redirect: false,
      });

      if (result?.error) {
        setError(emailMode === "signup" ? "Account created but sign-in failed. Please try signing in." : "Invalid email or password.");
        setLoading("idle");
      } else if (result?.url) {
        router.push(result.url);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading("idle");
    }
  }

  if (status === "loading" || status === "authenticated") {
    return (
      <div style={styles.fullScreen}>
        <style>{keyframes}</style>
        <div style={{ color: "#00ff88" }}><SpinnerIcon /></div>
      </div>
    );
  }

  const isLoading = loading !== "idle";

  return (
    <div style={styles.fullScreen}>
      <style>{keyframes}</style>
      <div style={styles.ambientGlow} />
      <div style={styles.card}>
        <div style={styles.brand}>
          <div style={styles.brandDot} />
          <span style={styles.brandName}>FitCoach</span>
        </div>
        <p style={styles.subtitle}>Your AI-powered personal fitness coach</p>
        <div style={styles.divider} />
        <div style={styles.providerStack}>
          <button onClick={handleGoogleSignIn} disabled={isLoading} style={{ ...styles.providerBtn, ...(loading === "google" ? styles.providerBtnActive : {}), ...(isLoading && loading !== "google" ? styles.providerBtnDisabled : {}) }}>
            <span style={styles.providerIcon}>{loading === "google" ? <SpinnerIcon /> : <GoogleIcon />}</span>
            <span style={styles.providerLabel}>Continue with Google</span>
          </button>
          <button onClick={handleMicrosoftSignIn} disabled={isLoading} style={{ ...styles.providerBtn, ...(loading === "microsoft" ? styles.providerBtnActive : {}), ...(isLoading && loading !== "microsoft" ? styles.providerBtnDisabled : {}) }}>
            <span style={styles.providerIcon}>{loading === "microsoft" ? <SpinnerIcon /> : <MicrosoftIcon />}</span>
            <span style={styles.providerLabel}>Continue with Microsoft</span>
          </button>
          <button onClick={handleEmailToggle} disabled={isLoading} style={{ ...styles.providerBtn, ...(emailOpen ? styles.providerBtnEmailOpen : {}), ...(isLoading && loading !== "email" ? styles.providerBtnDisabled : {}) }}>
            <span style={styles.providerIcon}><EnvelopeIcon /></span>
            <span style={styles.providerLabel}>Continue with Email</span>
            <span style={styles.chevron}><ChevronDown flipped={emailOpen} /></span>
          </button>
          <div ref={formRef} style={{ ...styles.emailFormWrapper, maxHeight: emailOpen ? "480px" : "0px", opacity: emailOpen ? 1 : 0, pointerEvents: emailOpen ? "auto" : "none" }}>
            <div style={styles.emailForm}>
              <div style={styles.modeToggleRow}>
                <button onClick={() => setEmailMode("signin")} style={{ ...styles.modeTab, ...(emailMode === "signin" ? styles.modeTabActive : {}) }}>Sign In</button>
                <button onClick={() => setEmailMode("signup")} style={{ ...styles.modeTab, ...(emailMode === "signup" ? styles.modeTabActive : {}) }}>Create Account</button>
              </div>
              <form onSubmit={handleEmailSubmit} style={styles.form}>
                <div style={{ ...styles.fieldWrapper, maxHeight: emailMode === "signup" ? "72px" : "0px", opacity: emailMode === "signup" ? 1 : 0, overflow: "hidden", transition: "max-height 0.3s ease, opacity 0.25s ease", marginBottom: emailMode === "signup" ? "12px" : "0px" }}>
                  <label style={styles.label}>Full Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Alex Johnson" required={emailMode === "signup"} tabIndex={emailMode === "signup" ? 0 : -1} style={styles.input} onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)} onBlur={(e) => Object.assign(e.target.style, styles.input)} autoComplete="name" />
                </div>
                <div style={{ marginBottom: "12px" }}>
                  <label style={styles.label}>Email</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required style={styles.input} onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)} onBlur={(e) => Object.assign(e.target.style, styles.input)} autoComplete="email" />
                </div>
                <div style={{ marginBottom: "16px" }}>
                  <label style={styles.label}>Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={emailMode === "signup" ? "Min. 8 characters" : "••••••••"} required minLength={emailMode === "signup" ? 8 : undefined} style={styles.input} onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)} onBlur={(e) => Object.assign(e.target.style, styles.input)} autoComplete={emailMode === "signup" ? "new-password" : "current-password"} />
                </div>
                {error && (<div style={styles.errorBox}><span style={styles.errorDot}>●</span>{error}</div>)}
                <button type="submit" disabled={isLoading} style={{ ...styles.submitBtn, ...(loading === "email" ? styles.submitBtnLoading : {}), ...(isLoading && loading !== "email" ? styles.providerBtnDisabled : {}) }}>
                  {loading === "email" ? (<span style={styles.submitBtnInner}><SpinnerIcon />{emailMode === "signup" ? "Creating account…" : "Signing in…"}</span>) : (<span style={styles.submitBtnInner}>{emailMode === "signup" ? "Create Account" : "Sign In"}</span>)}
                </button>
                <p style={styles.toggleText}>
                  {emailMode === "signin" ? "Don't have an account? " : "Already have an account? "}
                  <button type="button" onClick={handleModeToggle} style={styles.toggleLink}>{emailMode === "signin" ? "Create one" : "Sign in"}</button>
                </p>
              </form>
            </div>
          </div>
        </div>
        <p style={styles.footer}>By continuing, you agree to our <a href="/terms" style={styles.footerLink}>Terms</a> and <a href="/privacy" style={styles.footerLink}>Privacy Policy</a>.</p>
      </div>
    </div>
  );
}

const keyframes = `
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes pulseGlow { 0%, 100% { opacity: 0.4; transform: scale(1); } 50% { opacity: 0.6; transform: scale(1.05); } }
`;

const styles: Record<string, React.CSSProperties> = {
  fullScreen: { minHeight: "100dvh", background: "#080808", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px", position: "relative", overflow: "hidden", fontFamily: "var(--font-space-mono), 'Space Mono', monospace" },
  ambientGlow: { position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "600px", height: "600px", borderRadius: "50%", background: "radial-gradient(circle, rgba(0,255,136,0.06) 0%, transparent 70%)", pointerEvents: "none", animation: "pulseGlow 6s ease-in-out infinite" },
  card: { position: "relative", zIndex: 1, width: "100%", maxWidth: "420px", background: "#101010", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px", padding: "40px 36px 32px", boxShadow: "0 0 0 1px rgba(0,255,136,0.04), 0 24px 64px rgba(0,0,0,0.6)", animation: "fadeUp 0.4s ease both" },
  brand: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" },
  brandDot: { width: "10px", height: "10px", borderRadius: "50%", background: "#00ff88", boxShadow: "0 0 10px #00ff88, 0 0 20px rgba(0,255,136,0.4)", flexShrink: 0 },
  brandName: { fontFamily: "var(--font-syne), 'Syne', sans-serif", fontSize: "26px", fontWeight: 700, color: "#ebebeb", letterSpacing: "-0.5px" },
  subtitle: { fontFamily: "var(--font-space-mono), 'Space Mono', monospace", fontSize: "12px", color: "rgba(235,235,235,0.4)", margin: "0 0 0 20px", lineHeight: 1.5 },
  divider: { height: "1px", background: "rgba(255,255,255,0.06)", margin: "28px 0" },
  providerStack: { display: "flex", flexDirection: "column", gap: "10px" },
  providerBtn: { display: "flex", alignItems: "center", gap: "12px", width: "100%", padding: "13px 16px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "10px", color: "#ebebeb", fontSize: "13px", fontFamily: "var(--font-space-mono), 'Space Mono', monospace", fontWeight: 400, cursor: "pointer", transition: "background 0.15s ease, border-color 0.15s ease, transform 0.1s ease", textAlign: "left", letterSpacing: "0.2px" },
  providerBtnActive: { background: "rgba(0,255,136,0.06)", borderColor: "rgba(0,255,136,0.2)" },
  providerBtnEmailOpen: { background: "rgba(0,255,136,0.04)", borderColor: "rgba(0,255,136,0.15)", borderBottomLeftRadius: "0px", borderBottomRightRadius: "0px", borderBottom: "1px solid rgba(0,255,136,0.08)" },
  providerBtnDisabled: { opacity: 0.4, cursor: "not-allowed" },
  providerIcon: { display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, width: "20px", height: "20px" },
  providerLabel: { flex: 1 },
  chevron: { display: "flex", alignItems: "center", color: "rgba(235,235,235,0.4)" },
  emailFormWrapper: { overflow: "hidden", transition: "max-height 0.35s cubic-bezier(0.4,0,0.2,1), opacity 0.25s ease", marginTop: "-10px" },
  emailForm: { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderTop: "none", borderBottomLeftRadius: "10px", borderBottomRightRadius: "10px", padding: "20px 16px 16px" },
  modeToggleRow: { display: "flex", gap: "4px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", padding: "3px", marginBottom: "20px" },
  modeTab: { flex: 1, padding: "7px 12px", background: "transparent", border: "none", borderRadius: "6px", color: "rgba(235,235,235,0.45)", fontSize: "11px", fontFamily: "var(--font-space-mono), 'Space Mono', monospace", fontWeight: 400, cursor: "pointer", transition: "background 0.15s ease, color 0.15s ease", letterSpacing: "0.3px" },
  modeTabActive: { background: "rgba(0,255,136,0.1)", color: "#00ff88", border: "none" },
  form: { display: "flex", flexDirection: "column" },
  fieldWrapper: { display: "flex", flexDirection: "column" },
  label: { display: "block", fontSize: "10px", fontFamily: "var(--font-space-mono), 'Space Mono', monospace", color: "rgba(235,235,235,0.4)", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: "6px" },
  input: { width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#ebebeb", fontSize: "13px", fontFamily: "var(--font-space-mono), 'Space Mono', monospace", outline: "none", transition: "border-color 0.15s ease, background 0.15s ease", boxSizing: "border-box" },
  inputFocus: { width: "100%", padding: "10px 12px", background: "rgba(0,255,136,0.04)", border: "1px solid rgba(0,255,136,0.25)", borderRadius: "8px", color: "#ebebeb", fontSize: "13px", fontFamily: "var(--font-space-mono), 'Space Mono', monospace", outline: "none", transition: "border-color 0.15s ease, background 0.15s ease", boxSizing: "border-box" },
  errorBox: { display: "flex", alignItems: "flex-start", gap: "8px", padding: "10px 12px", background: "rgba(255,59,59,0.08)", border: "1px solid rgba(255,59,59,0.2)", borderRadius: "8px", color: "#ff6b6b", fontSize: "11px", fontFamily: "var(--font-space-mono), 'Space Mono', monospace", lineHeight: 1.5, marginBottom: "12px" },
  errorDot: { fontSize: "8px", color: "#ff4444", flexShrink: 0, marginTop: "2px" },
  submitBtn: { width: "100%", padding: "12px 16px", background: "#00ff88", border: "none", borderRadius: "8px", color: "#080808", fontSize: "13px", fontFamily: "var(--font-space-mono), 'Space Mono', monospace", fontWeight: 700, cursor: "pointer", transition: "background 0.15s ease, transform 0.1s ease, opacity 0.15s ease", letterSpacing: "0.3px", marginBottom: "12px" },
  submitBtnLoading: { background: "rgba(0,255,136,0.5)", cursor: "not-allowed" },
  submitBtnInner: { display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" },
  toggleText: { textAlign: "center", fontSize: "11px", fontFamily: "var(--font-space-mono), 'Space Mono', monospace", color: "rgba(235,235,235,0.35)", margin: 0, lineHeight: 1.6 },
  toggleLink: { background: "none", border: "none", color: "#00ff88", fontSize: "11px", fontFamily: "var(--font-space-mono), 'Space Mono', monospace", cursor: "pointer", padding: 0, textDecoration: "underline", textDecorationColor: "rgba(0,255,136,0.4)" },
  footer: { marginTop: "24px", textAlign: "center", fontSize: "10px", fontFamily: "var(--font-space-mono), 'Space Mono', monospace", color: "rgba(235,235,235,0.2)", lineHeight: 1.7 },
  footerLink: { color: "rgba(0,255,136,0.5)", textDecoration: "none" },
};
