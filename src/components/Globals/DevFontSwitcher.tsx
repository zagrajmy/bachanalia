"use client";

import { useEffect, useState } from "react";

const FONTS = [
  ["Karrik", "var(--font-karrik)"],
  ["Familjen Grotesk", "var(--font-familjen)"],
  ["Bricolage Grotesque", "var(--font-bricolage)"],
  ["Le Murmure", "var(--font-murmure)"],
  ["Basteleur", "var(--font-basteleur)"],
  ["Gulax", "var(--font-gulax)"],
  ["Switzer", "var(--font-switzer)"],
  ["Instrument Sans", "var(--font-instrument)"],
  ["Cinzel", "var(--font-cinzel)"],
];

const KNOBS = [
  { key: "--font-display", label: "Nagłówki", options: FONTS, fallback: "var(--font-bricolage)" },
  { key: "--font-body", label: "Tekst", options: FONTS, fallback: "var(--font-bricolage)" },
  {
    key: "--display-weight",
    label: "Waga",
    options: [400, 500, 600, 700].map((w) => [String(w), String(w)]),
    fallback: "600",
  },
  { key: "--font-button", label: "Przycisk", options: FONTS, fallback: "var(--font-cinzel)" },
  {
    key: "--font-button-weight",
    label: "Grubość",
    options: [400, 500, 600, 700].map((w) => [String(w), String(w)]),
    fallback: "500",
  },
  {
    key: "--wc-hue",
    label: "Odcień",
    options: [0, 8, 13, 18, 26, 40].map((d) => [`${d}°`, `${d}deg`]),
    fallback: "13deg",
  },
];

export function DevFontSwitcher() {
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("dev-fonts") ?? "{}");
    setValues(stored);
    for (const [key, value] of Object.entries(stored)) {
      document.documentElement.style.setProperty(key, value as string);
    }
  }, []);

  const set = (key: string, value: string) => {
    const next = { ...values, [key]: value };
    setValues(next);
    localStorage.setItem("dev-fonts", JSON.stringify(next));
    document.documentElement.style.setProperty(key, value);
  };

  return (
    <div className="fixed right-3 bottom-3 z-50 flex flex-col gap-1 rounded-card border border-navy/30 bg-paper/95 p-2 text-[11px] shadow-lg backdrop-blur">
      {KNOBS.map(({ key, label, options, fallback }) => (
        <label key={key} className="flex items-center gap-2">
          <span className="w-16 text-ink-muted">{label}</span>
          <select
            value={values[key] ?? fallback}
            onChange={(event) => set(key, event.target.value)}
            className="rounded-sm border border-navy/25 bg-paper px-1 py-0.5"
          >
            {options.map(([name, value]) => (
              <option key={String(value)} value={String(value)}>
                {name}
              </option>
            ))}
          </select>
        </label>
      ))}
    </div>
  );
}
