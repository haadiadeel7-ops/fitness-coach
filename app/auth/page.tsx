"use client";

import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

function SpinnerIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      style={{ animation: "spin 0.8s linear infinite" }}
    >
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

type EmailMode = "signin" | "signup";

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export default function AuthPage() {
  const { status } = useSession();
  const router = useRouter();

  const [emailMode, setEmailMode] = useState<EmailMode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") router.replace("/");
  }, [status, router]);

  function handleModeToggle() {
    setEmailMode((prev) => (prev === "signin" ? "signup" : "signin"));
    setError("");
    setName("");
    setPassword("");
  }

  function handleGuest() {
    localStorage.setItem("fitcoach_guest", "true");
    router.push("/");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

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
          setLoading(false);
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
        setError(
          emailMode === "signup"
            ? "Account created but sign-in failed. Try signing in."
            : "Invalid email or password."
        );
        setLoading(false);
      } else if (result?.url) {
        router.push(result.url);
      }
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
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

  return (
    <div style={styles.fullScreen}>
      <style>{keyframes}</style>
      <div style={styles.ambientGlow} />

      <div style={styles.card}>
        {/* Branding */}
        <div style={styles.brand}>
          <div style={styles.brandDot} />
          <span style={styles.brandName}>FitCoach</span>
        </div>
        <p style={styles.subtitle}>Your AI-powered personal fitness coach</p>

        <div style={styles.divider} />

        {/* Mode tabs */}
        <div style={styles.modeToggleRow}>
          <button
            onClick={() => { setEmailMode("signin"); setError(""); }}
            style={{ ...styles.modeTab, ...(emailMode === "signin" ? styles.modeTabActive : {}) }}
          >
            Sign In
          </button>
          <button
            onClick={() => { setEmailMode("signup"); setError(""); }}
            style={{ ...styles.modeTab, ...(emailMode === "signup" ? styles.modeTabActive : {}) }}
          >
            Create Account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={{
            ...styles.fieldWrapper,
            maxHeight: emailMode === "signup" ? "72px" : "0px",
            opacity: emailMode === "signup" ? 1 : 0,
            overflow: "hidden",
            transition: "max-height 0.3s ease, opacity 0.25s ease",
            marginBottom: emailMode === "signup" ? "12px" : "0px",
          }}>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Alex Johnson"
              required={emailMode === "signup"}
              tabIndex={emailMode === "signup" ? 0 : -1}
              style={styles.input}
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => Object.assign(e.target.style, styles.input)}
              autoComplete="name"
            />
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={styles.input}
              onFocus={(e) => Object.assign(e.target.style, styles.inputFocus)}
              onBlur={(e) => Object.assign(e.target.style, styles.input)}
              autoComplete="email"
            />
          </div>

          <div style={{ marginBottom: "16px" }}>
            <label style={styles.label}>Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={emailMode === "signup" ? "Min. 8 characters" : "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}
                required
                minLength={emailMode === "signup" ? 8 : undefined}
                style={{ ...styles.input, paddingRight: "40px" }}
                onFocus={(e) => Object.assign(e.target.style, { ...styles.inputFocus, paddingRight: "40px" })}
                onBlur={(e) => Object.assign(e.target.style, { ...styles.input, paddingRight: "40px" })}
                autoComplete={emailMode === "signup" ? "new-password" : "current-password"}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                style={styles.eyeBtn}
              >
                <EyeIcon open={showPassword} />
              </button>
            </div>
          </div>

          {error && (
            <div style={styles.errorBox}>
              <span style={styles.errorDot}>\u25cf</span>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.submitBtn, ...(loading ? styles.submitBtnLoading : {}) }}
          >
            {loading ? (
              <span style={styles.btnInner}><SpinnerIcon />{emailMode === "signup" ? "Creating account\u2026" : "Signing in\u2026"}</span>
            ) : (
              <span style={styles.btnInner}>{emailMode === "signup" ? "Create Account" : "Sign In"}</span>
            )}
          </button>

          <p style={styles.toggleText}>
            {emailMode === "signin" ? "Don't have an account? " : "Already have an account? "}
            <button type="button" onClick={handleModeToggle} style={styles.toggleLink}>
              {emailMode === "signin" ? "Create one" : "Sign in"}
            </button>
          </p>
        </form>

        {/* Guest option */}
        <div style={{ textAlign: "center", marginTop: "16px", paddingTop: "16px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <button
            type="button"
            onClick={handleGuest}
            style={{
              background: "none",
              border: "none",
              color: "rgba(235,235,235,0.3)",
              fontSize: "11px",
              fontFamily: "var(--font-space-mono), 'Space Mono', monospace",
              cursor: "pointer",
              letterSpacing: "0.3px",
              textDecoration: "underline",
              textDecorationColor: "rgba(235,235,235,0.12)",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "rgba(235,235,235,0.55)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(235,235,235,0.3)")}
          >
            Continue as guest &mdash; 7 messages/day, no image generation
          </button>
        </div>

        <p style={styles.footer}>
          By continuing, you agree to our{" "}
          <a href="/terms" style={styles.footerLink}>Terms</a> and{" "}
          <a href="/privacy" style={styles.footerLink}>Privacy Policy</a>.
        </p>
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
  fullScreen: {
    minHeight: "100dvh",
    background: "#080808",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px 16px",
    position: "relative",
    overflow: "hidden",
    fontFamily: "var(--font-space-mono), 'Space Mono', monospace",
  },
  ambientGlow: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "600px",
    height: "600px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(0,255,136,0.06) 0%, transparent 70%)",
    pointerEvents: "none",
    animation: "pulseGlow 6s ease-in-out infinite",
  },
  card: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    maxWidth: "400px",
    background: "#101010",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "16px",
    padding: "40px 36px 32px",
    boxShadow: "0 0 0 1px rgba(0,255,136,0.04), 0 24px 64px rgba(0,0,0,0.6)",
    animation: "fadeUp 0.4s ease both",
  },
  brand: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" },
  brandDot: {
    width: "10px", height: "10px", borderRadius: "50%", background: "#00ff88", flexShrink: 0,
    boxShadow: "0 0 10px #00ff88, 0 0 20px rgba(0,255,136,0.4)",
  },
  brandName: {
    fontFamily: "var(--font-syne), 'Syne', sans-serif",
    fontSize: "26px", fontWeight: 700, color: "#ebebeb", letterSpacing: "-0.5px",
  },
  subtitle: {
    fontFamily: "var(--font-space-mono), 'Space Mono', monospace",
    fontSize: "12px", color: "rgba(235,235,235,0.4)", margin: "0 0 0 20px", lineHeight: 1.5,
  },
  divider: { height: "1px", background: "rgba(255,255,255,0.06)", margin: "28px 0 20px" },
  modeToggleRow: {
    display: "flex", gap: "4px",
    background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: "8px", padding: "3px", marginBottom: "20px",
  },
  modeTab: {
    flex: 1, padding: "8px 12px", background: "transparent", border: "none",
    borderRadius: "6px", color: "rgba(235,235,235,0.45)", fontSize: "12px",
    fontFamily: "var(--font-space-mono), 'Space Mono', monospace",
    cursor: "pointer", transition: "background 0.15s ease, color 0.15s ease", letterSpacing: "0.3px",
  },
  modeTabActive: { background: "rgba(0,255,136,0.1)", color: "#00ff88", border: "none" },
  form: { display: "flex", flexDirection: "column" },
  fieldWrapper: { display: "flex", flexDirection: "column" },
  label: {
    display: "block", fontSize: "10px", fontFamily: "var(--font-space-mono), 'Space Mono', monospace",
    color: "rgba(235,235,235,0.4)", letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: "6px",
  },
  input: {
    width: "100%", padding: "10px 12px", background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#ebebeb",
    fontSize: "13px", fontFamily: "var(--font-space-mono), 'Space Mono', monospace",
    outline: "none", transition: "border-color 0.15s ease, background 0.15s ease", boxSizing: "border-box",
  },
  inputFocus: {
    width: "100%", padding: "10px 12px", background: "rgba(0,255,136,0.04)",
    border: "1px solid rgba(0,255,136,0.25)", borderRadius: "8px", color: "#ebebeb",
    fontSize: "13px", fontFamily: "var(--font-space-mono), 'Space Mono', monospace",
    outline: "none", transition: "border-color 0.15s ease, background 0.15s ease", boxSizing: "border-box",
  },
  eyeBtn: {
    position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)",
    background: "none", border: "none", color: "rgba(235,235,235,0.35)", cursor: "pointer",
    padding: "2px", display: "flex", alignItems: "center", justifyContent: "center",
  },
  errorBox: {
    display: "flex", alignItems: "flex-start", gap: "8px", padding: "10px 12px",
    background: "rgba(255,59,59,0.08)", border: "1px solid rgba(255,59,59,0.2)",
    borderRadius: "8px", color: "#ff6b6b", fontSize: "11px",
    fontFamily: "var(--font-space-mono), 'Space Mono', monospace", lineHeight: 1.5, marginBottom: "12px",
  },
  errorDot: { fontSize: "8px", color: "#ff4444", flexShrink: 0, marginTop: "2px" },
  submitBtn: {
    width: "100%", padding: "12px 16px", background: "#00ff88", border: "none",
    borderRadius: "8px", color: "#080808", fontSize: "13px",
    fontFamily: "var(--font-space-mono), 'Space Mono', monospace", fontWeight: 700,
    cursor: "pointer", transition: "opacity 0.15s ease", letterSpacing: "0.3px", marginBottom: "14px",
  },
  submitBtnLoading: { background: "rgba(0,255,136,0.5)", cursor: "not-allowed" },
  btnInner: { display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" },
  toggleText: {
    textAlign: "center", fontSize: "11px",
    fontFamily: "var(--font-space-mono), 'Space Mono', monospace",
    color: "rgba(235,235,235,0.35)", margin: 0, lineHeight: 1.6,
  },
  toggleLink: {
    background: "none", border: "none", color: "#00ff88", fontSize: "11px",
    fontFamily: "var(--font-space-mono), 'Space Mono', monospace", cursor: "pointer",
    padding: 0, textDecoration: "underline", textDecorationColor: "rgba(0,255,136,0.4)",
  },
  footer: {
    marginTop: "24px", textAlign: "center", fontSize: "10px",
    fontFamily: "var(--font-space-mono), 'Space Mono', monospace",
    color: "rgba(235,235,235,0.2)", lineHeight: 1.7,
  },
  footerLink: { color: "rgba(0,255,136,0.5)", textDecoration: "none" },
};
