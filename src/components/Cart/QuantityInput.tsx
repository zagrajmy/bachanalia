"use client";

import { NumberField } from "@base-ui/react/number-field";
import { useId } from "react";

import { GROUP_CLASS, INPUT_CLASS, MAX_QUANTITY, STEP_CLASS } from "./quantity";

const MIN = 1;

/**
 * Base UI's NumberField does the heavy lifting — arrow keys, Shift for big
 * steps, wheel scrub, clamping, and a hidden raw-value input so the form
 * still receives a plain number.
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

  return (
    <NumberField.Root
      id={id}
      name={name}
      min={MIN}
      max={MAX_QUANTITY}
      defaultValue={defaultValue}
      disabled={disabled}
      allowWheelScrub
      onValueChange={(value) => {
        if (value !== null) onValueChange?.(value);
      }}
    >
      <label className="eyebrow block text-ink-muted" htmlFor={id}>
        {label}
      </label>
      <NumberField.Group className={`mt-2 ${GROUP_CLASS}`}>
        <NumberField.Decrement className={STEP_CLASS} aria-label="Zmniejsz ilość">
          −
        </NumberField.Decrement>
        <NumberField.Input className={INPUT_CLASS} inputMode="numeric" />
        <NumberField.Increment className={STEP_CLASS} aria-label="Zwiększ ilość">
          +
        </NumberField.Increment>
      </NumberField.Group>
    </NumberField.Root>
  );
}
