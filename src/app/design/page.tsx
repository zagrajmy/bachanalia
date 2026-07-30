import type { Metadata } from "next";

import { Button } from "@/components/ui/warcraftcn/button";

import styles from "./button.module.css";

export const metadata: Metadata = { title: "Design", robots: { index: false } };

const shapes = [
  { key: "", label: "bevel" },
  { key: styles.notched, label: "notch" },
  { key: styles.scooped, label: "scoop" },
];

const variants = [
  { key: "", label: "primary" },
  { key: styles.accent, label: "accent" },
  { key: styles.ghost, label: "ghost" },
];

function Row({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-14">
      <h2 className="eyebrow uppercase text-ink-muted">{title}</h2>
      <div className="mt-4 flex flex-wrap items-center gap-4">{children}</div>
    </section>
  );
}

export default function DesignPage() {
  return (
    <div className="gutter mx-auto max-w-4xl py-16">
      <h1 className="display text-5xl">Button</h1>
      <p className="mt-3 max-w-[55ch] text-ink-muted">
        Metal plate with an etched inner frame and an ember that lights up from below on hover.
        Shape is one line of <code>corner-shape</code>; the frame is <code>::before</code>, the
        ember <code>::after</code>.
      </p>

      {shapes.map((shape) => (
        <Row key={shape.label} title={shape.label}>
          {variants.map((variant) => (
            <button className={`${styles.btn} ${shape.key} ${variant.key}`} key={variant.label}>
              Kup akredytację
            </button>
          ))}
        </Row>
      ))}

      <Row title="warcraftcn (border-image)">
        <Button>Kup akredytację</Button>
        <Button variant="frame">Kup akredytację</Button>
      </Row>

      <Row title="warcraftcn, recreated in css">
        <button className={styles.plate}>Kup akredytację</button>
        <button className={styles.plate}>Program</button>
      </Row>

      <Row title="sizes">
        <button className={`${styles.btn} ${styles.sm}`}>Mały</button>
        <button className={styles.btn}>Średni</button>
        <button className={`${styles.btn} ${styles.lg}`}>Duży</button>
      </Row>

      <Row title="disabled">
        <button className={styles.btn} disabled>
          Wyprzedane
        </button>
        <button className={`${styles.btn} ${styles.accent}`} disabled>
          Wyprzedane
        </button>
      </Row>

      <div className="ink-inverted mt-14 rounded-card bg-navy-deep p-10">
        <h2 className="eyebrow uppercase text-ink-muted">on navy</h2>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <button className={`${styles.btn} ${styles.notched} ${styles.accent}`}>
            Kup akredytację
          </button>
          <button className={`${styles.btn} ${styles.notched} ${styles.ghost}`}>Program</button>
        </div>
      </div>
    </div>
  );
}
