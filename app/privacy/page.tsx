export default function PrivacyPage() {
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <a href="/" style={styles.back}>&#8592; Back</a>
          <div style={styles.brand}>
            <div style={styles.dot} />
            <span style={styles.brandName}>FitCoach</span>
          </div>
        </div>

        <h1 style={styles.title}>Privacy Policy</h1>
        <p style={styles.meta}>Last updated: March 2026</p>

        <div style={styles.divider} />

        <Section title="1. Overview">
          FitCoach is committed to protecting your privacy. This policy explains what information we collect, how we use it, and the choices you have. We do not sell your personal data to third parties.
        </Section>

        <Section title="2. Information We Collect">
          <strong style={{ color: "#ebebeb" }}>Account information:</strong> When you create an account, we collect your name and email address. Your password is hashed using bcrypt and never stored in plain text.
          <br /><br />
          <strong style={{ color: "#ebebeb" }}>Fitness profile:</strong> If you choose to fill in your profile, we collect optional details such as age, gender, height, weight, fitness goal, and activity level. This data is used solely to personalize coaching responses.
          <br /><br />
          <strong style={{ color: "#ebebeb" }}>Chat messages:</strong> Conversations with FitCoach are stored locally in your browser (localStorage) and passed to our AI backend to generate responses. Chat history is not permanently stored on our servers beyond what is needed for session memory.
          <br /><br />
          <strong style={{ color: "#ebebeb" }}>Usage data:</strong> We track basic usage metrics such as message count and last active date, stored locally in your browser.
        </Section>

        <Section title="3. How We Use Your Information">
          We use your information to:
          <ul style={styles.list}>
            <li>Authenticate your account and maintain your session</li>
            <li>Personalize AI coaching responses based on your fitness profile</li>
            <li>Maintain conversation context within a session</li>
            <li>Track your progress metrics (message count, streaks) locally</li>
            <li>Improve the quality and accuracy of our service</li>
          </ul>
        </Section>

        <Section title="4. Data Storage">
          Most of your data (chat history, profile, progress) is stored locally in your browser using localStorage. It remains on your device and is not uploaded to our servers unless required to process a coaching request.
          <br /><br />
          Account credentials (email and hashed password) are stored securely in our backend database, which is managed through n8n workflow automation.
        </Section>

        <Section title="5. Third-Party Services">
          FitCoach uses the following third-party services:
          <ul style={styles.list}>
            <li><strong style={{ color: "#ebebeb" }}>OpenAI:</strong> Powers the AI coaching responses and image generation. Your messages and profile data are sent to OpenAI to generate responses, subject to OpenAI&apos;s privacy policy.</li>
            <li><strong style={{ color: "#ebebeb" }}>YouTube:</strong> Video links direct you to YouTube search results. Clicking these links is subject to YouTube&apos;s privacy policy.</li>
            <li><strong style={{ color: "#ebebeb" }}>Vercel:</strong> Hosts the application. Standard server logs may be collected by Vercel.</li>
          </ul>
          We do not share your personal data with any other third parties.
        </Section>

        <Section title="6. Data Retention">
          Your account data is retained as long as your account is active. You may request deletion of your account and associated data at any time. Chat history stored locally in your browser can be cleared at any time through your browser settings or by signing out of the app.
        </Section>

        <Section title="7. Your Rights">
          You have the right to:
          <ul style={styles.list}>
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your account and data</li>
            <li>Withdraw consent for data processing at any time</li>
          </ul>
          To exercise any of these rights, contact us through the app.
        </Section>

        <Section title="8. Security">
          We take reasonable technical measures to protect your data, including password hashing, HTTPS encryption, and secure environment variable management. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
        </Section>

        <Section title="9. Children's Privacy">
          FitCoach is not intended for users under the age of 16. We do not knowingly collect personal information from children under 16. If you believe a child has provided us with personal data, please contact us and we will promptly delete it.
        </Section>

        <Section title="10. Changes to This Policy">
          We may update this Privacy Policy from time to time. We will notify users of significant changes by updating the date at the top of this page. Continued use of the service after changes are posted constitutes acceptance of the updated policy.
        </Section>

        <Section title="11. Contact">
          If you have any questions or concerns about this Privacy Policy, please contact us through the app or via the email address associated with your account.
        </Section>

        <div style={styles.divider} />
        <p style={styles.footer}>This Privacy Policy is effective as of March 2026 and applies to all users of FitCoach.</p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: "32px" }}>
      <h2 style={{
        fontSize: "14px",
        fontWeight: 700,
        color: "#00ff88",
        letterSpacing: "0.04em",
        marginBottom: "10px",
        fontFamily: "var(--font-space-mono), monospace",
        textTransform: "uppercase",
      }}>{title}</h2>
      <div style={{
        fontSize: "14px",
        color: "rgba(235,235,235,0.7)",
        lineHeight: 1.8,
        fontFamily: "var(--font-syne), sans-serif",
      }}>{children}</div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100dvh",
    background: "#080808",
    padding: "40px 24px 80px",
    fontFamily: "var(--font-syne), sans-serif",
  },
  container: {
    maxWidth: "680px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "48px",
  },
  back: {
    fontSize: "12px",
    color: "rgba(235,235,235,0.4)",
    textDecoration: "none",
    fontFamily: "var(--font-space-mono), monospace",
    letterSpacing: "0.06em",
  },
  brand: { display: "flex", alignItems: "center", gap: "8px" },
  dot: {
    width: "8px", height: "8px", borderRadius: "50%", background: "#00ff88",
    boxShadow: "0 0 8px #00ff88",
  },
  brandName: {
    fontSize: "16px", fontWeight: 700, color: "#ebebeb",
    fontFamily: "var(--font-syne), sans-serif",
  },
  title: {
    fontSize: "32px",
    fontWeight: 800,
    color: "#ebebeb",
    letterSpacing: "-0.02em",
    marginBottom: "8px",
  },
  meta: {
    fontSize: "11px",
    color: "rgba(235,235,235,0.3)",
    fontFamily: "var(--font-space-mono), monospace",
    letterSpacing: "0.06em",
  },
  divider: {
    height: "1px",
    background: "rgba(255,255,255,0.06)",
    margin: "32px 0",
  },
  list: {
    margin: "10px 0 0 0",
    paddingLeft: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  footer: {
    fontSize: "11px",
    color: "rgba(235,235,235,0.2)",
    fontFamily: "var(--font-space-mono), monospace",
    lineHeight: 1.7,
    textAlign: "center",
  },
};
