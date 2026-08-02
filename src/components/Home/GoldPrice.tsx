"use client";

import { useCallback, useRef, type ReactNode } from "react";

function Glint({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  const scramble = useCallback(() => {
    const node = ref.current;
    if (!node) return;
    node.style.left = `${8 + Math.random() * 74}%`;
    node.style.top = `${6 + Math.random() * 70}%`;
    node.style.rotate = `${Math.random() * 360}deg`;
  }, []);

  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={`gold-glint ${className}`}
      onAnimationIteration={scramble}
      onAnimationStart={scramble}
    />
  );
}

export function GoldPrice({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={`gold ${className}`}>
      {children}
      <Glint />
      <Glint className="gold-glint-late" />
    </span>
  );
}
