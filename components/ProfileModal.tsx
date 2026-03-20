"use client";

import { useState } from "react";
import { UserData, UserProfile } from "@/lib/storage";

interface Props {
  user: UserData;
  onSave: (profile: UserProfile) => void;
  onClose: () => void;
}

const GOALS = [
  "Lose weight",
  "Build muscle",
  "Improve endurance",
  "Stay active",
  "General health",
];

const ACTIVITY_LEVELS = [
  "Sedentary",
  "Lightly active",
  "Moderately active",
  "Very active",
  "Athlete",
];

const GENDERS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

export default function ProfileModal({ user, onSave, onClose }: Props) {
  const [form, setForm] = useState<UserProfile>({ ...user.profile });
  const [useImperial, setUseImperial] = useState(false);

  const set = (key: keyof UserProfile, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSave = () => {
    onSave(form);
    onClose();
  };

  // Display helpers for imperial toggle
  const heightDisplay = () => {
    if (!form.heightCm || !useImperial) return form.heightCm;
    const totalIn = Math.round(parseFloat(form.heightCm) / 2.54);
    return `${Math.floor(totalIn / 12)}'${totalIn % 12}"`;
  };

  const weightDisplay = () => {
    if (!form.weightKg || !useImperial) return form.weightKg;
    return Math.round(parseFloat(form.weightKg) * 2.205).toString();
  };

  const handleHeightChange = (val: string) => {
    if (!useImperial) {
      set("heightCm", val);
    } else {
      // parse ft'in" or just inches
      const ftIn = val.match(/^(\d+)'(\d+)"?$/);
      if (ftIn) {
        const cm = Math.round((parseInt(ftIn[1]) * 12 + parseInt(ftIn[2])) * 2.54);
        set("heightCm", cm.toString());
      } else if (/^\d+$/.test(val)) {
        set("heightCm", Math.round(parseFloat(val) * 2.54).toString());
      }
    }
  };

  const handleWeightChange = (val: string) => {
    if (!useImperial) {
      set("weightKg", val);
    } else {
      const kg = Math.round(parseFloat(val) / 2.205);
      if (!isNaN(kg)) set("weightKg", kg.toString());
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        animation: "fadeIn 0.2s ease",
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border-2)",
          width: "100%",
          maxWidth: "480px",
          maxHeight: "90vh",
          overflowY: "auto",
          animation: "scaleIn 0.25s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 24px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div>
            <div
              style={{
                fontSize: "10px",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                color: "var(--text-muted)",
                fontFamily: "var(--font-space-mono)",
                marginBottom: "4px",
              }}
            >
              Settings
            </div>
            <div style={{ fontSize: "18px", fontWeight: 800, letterSpacing: "-0.02em" }}>
              Your Profile
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--text-muted)",
              fontSize: "20px",
              cursor: "pointer",
              lineHeight: 1,
              padding: "4px",
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: "24px" }}>
          {/* Name */}
          <Section label="Name">
            <Input
              value={user.name}
              disabled
              placeholder="Your name"
              hint="Name set at sign-up"
            />
          </Section>

          {/* Age */}
          <Section label="Age">
            <Input
              type="number"
              value={form.age}
              onChange={(v) => set("age", v)}
              placeholder="e.g. 25"
            />
          </Section>

          {/* Gender */}
          <Section label="Gender">
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {GENDERS.map((g) => (
                <PillButton
                  key={g.value}
                  label={g.label}
                  active={form.gender === g.value}
                  onClick={() => set("gender", form.gender === g.value ? "" : g.value)}
                />
              ))}
            </div>
          </Section>

          {/* Height & Weight with unit toggle */}
          <Section
            label={
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span>Body Stats</span>
                <UnitToggle imperial={useImperial} onChange={setUseImperial} />
              </div>
            }
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div>
                <div style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-space-mono)", letterSpacing: "0.1em", marginBottom: "6px", textTransform: "uppercase" }}>
                  Height {useImperial ? "(ft'in\")" : "(cm)"}
                </div>
                <input
                  type="text"
                  value={heightDisplay()}
                  onChange={(e) => handleHeightChange(e.target.value)}
                  placeholder={useImperial ? "5'10\"" : "178"}
                  style={inputStyle}
                />
              </div>
              <div>
                <div style={{ fontSize: "10px", color: "var(--text-muted)", fontFamily: "var(--font-space-mono)", letterSpacing: "0.1em", marginBottom: "6px", textTransform: "uppercase" }}>
                  Weight {useImperial ? "(lbs)" : "(kg)"}
                </div>
                <input
                  type="text"
                  value={weightDisplay()}
                  onChange={(e) => handleWeightChange(e.target.value)}
                  placeholder={useImperial ? "175" : "80"}
                  style={inputStyle}
                />
              </div>
            </div>
          </Section>

          {/* Goal */}
          <Section label="Fitness Goal">
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {GOALS.map((g) => (
                <PillButton
                  key={g}
                  label={g}
                  active={form.goal === g}
                  onClick={() => set("goal", form.goal === g ? "" : g)}
                />
              ))}
            </div>
          </Section>

          {/* Activity Level */}
          <Section label="Activity Level">
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {ACTIVITY_LEVELS.map((a) => (
                <PillButton
                  key={a}
                  label={a}
                  active={form.activityLevel === a}
                  onClick={() => set("activityLevel", form.activityLevel === a ? "" : a)}
                />
              ))}
            </div>
          </Section>

          {/* Save */}
          <button
            onClick={handleSave}
            style={{
              width: "100%",
              marginTop: "8px",
              background: "var(--accent)",
              color: "#000",
              border: "none",
              padding: "14px",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: "pointer",
              fontFamily: "var(--font-syne)",
            }}
          >
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ─────────────────────────────── */

function Section({
  label,
  children,
}: {
  label: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: "22px" }}>
      <div
        style={{
          fontSize: "10px",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--text-muted)",
          fontFamily: "var(--font-space-mono)",
          marginBottom: "10px",
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--surface-2)",
  border: "1px solid var(--border-2)",
  color: "var(--text)",
  padding: "10px 12px",
  fontSize: "14px",
  fontFamily: "var(--font-syne)",
  outline: "none",
};

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
  hint,
}: {
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          ...inputStyle,
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? "not-allowed" : "text",
        }}
      />
      {hint && (
        <div style={{ fontSize: "10px", color: "var(--text-dim)", fontFamily: "var(--font-space-mono)", marginTop: "5px" }}>
          {hint}
        </div>
      )}
    </div>
  );
}

function PillButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? "var(--accent-dim)" : "transparent",
        border: `1px solid ${active ? "var(--accent)" : "var(--border-2)"}`,
        color: active ? "var(--accent)" : "var(--text-muted)",
        padding: "6px 12px",
        fontSize: "11px",
        fontWeight: active ? 700 : 400,
        cursor: "pointer",
        fontFamily: "var(--font-syne)",
        letterSpacing: "0.04em",
        transition: "all 0.15s",
      }}
    >
      {label}
    </button>
  );
}

function UnitToggle({
  imperial,
  onChange,
}: {
  imperial: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        background: "var(--surface-3)",
        border: "1px solid var(--border)",
        overflow: "hidden",
      }}
    >
      {["cm/kg", "ft/lbs"].map((label, i) => {
        const active = (i === 1) === imperial;
        return (
          <button
            key={label}
            onClick={() => onChange(i === 1)}
            style={{
              background: active ? "var(--border-2)" : "transparent",
              border: "none",
              color: active ? "var(--text)" : "var(--text-muted)",
              padding: "4px 10px",
              fontSize: "10px",
              fontFamily: "var(--font-space-mono)",
              cursor: "pointer",
              letterSpacing: "0.06em",
              transition: "all 0.15s",
            }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
