"use client";

import { useId, useState } from "react";

import { MAX_QUANTITY, STEP_CLASS } from "./quantity";

const MIN = 1;

const clamp = (value: number) => Math.min(Math.max(value, MIN), MAX_QUANTITY);

/**
 * A number input the mouse can nudge and the keyboard can type into, rather
 * than two buttons around a read-only figure. The steppers are real buttons,
 * so Tab reaches them and Enter works.
 */
export function QuantityInput({
  name,
  label,
  defaultValue,
  onValueChange,
  disabled,
}: {
  name: string;
  label: string;
  defaultValue: number;
  onValueChange?: (value: number) => void;
  disabled?: boolean;
}) {
  const id = useId();
  const [value, setValue] = useState(clamp(defaultValue));

  const change = (next: number) => {
    const clamped = clamp(next);
    setValue(clamped);
    onValueChange?.(clamped);
  };

  return (
    <div>
      <label className="eyebrow block text-ink-muted" htmlFor={id}>
        {label}
      </label>

      <div className="mt-2 flex items-center gap-1.5">
        <button
          type="button"
          className={STEP_CLASS}
          onClick={() => change(value - 1)}
          disabled={disabled || value <= MIN}
          aria-label="Zmniejsz ilość"
        >
          −
        </button>

        <input
          id={id}
          name={name}
          type="number"
          inputMode="numeric"
          min={MIN}
          max={MAX_QUANTITY}
          step={1}
          value={value}
          disabled={disabled}
          onChange={(event) => change(Number(event.target.value))}
          className="w-14 rounded-card border border-dashed border-hairline bg-transparent px-2 py-1.5 text-center tabular-nums"
        />

        <button
          type="button"
          className={STEP_CLASS}
          onClick={() => change(value + 1)}
          disabled={disabled || value >= MAX_QUANTITY}
          aria-label="Zwiększ ilość"
        >
          +
        </button>
      </div>
    </div>
  );
}
