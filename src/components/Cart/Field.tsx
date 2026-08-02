"use client";

import type { BillingField } from "./billing";

/**
 * Label, input and message are wired together rather than merely stacked:
 * `htmlFor` names the control, `aria-describedby` points at the message, and
 * `aria-invalid` marks the control itself, so a screen reader reads the
 * problem when focus lands on the field that caused it.
 */
export function Field({
  field,
  error,
  defaultValue,
  disabled,
}: {
  field: BillingField;
  error?: string;
  defaultValue?: string;
  disabled?: boolean;
}) {
  const id = `bill-${field.name}`;
  const errorId = `${id}-error`;

  return (
    <div className={field.half ? "sm:col-span-1" : "sm:col-span-2"}>
      <label className="eyebrow block text-ink-muted" htmlFor={id}>
        {field.label}
      </label>

      <input
        id={id}
        name={field.name}
        type={field.type}
        autoComplete={field.autoComplete}
        inputMode={field.inputMode}
        defaultValue={defaultValue}
        disabled={disabled}
        required
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`mt-2 w-full rounded-card border bg-transparent px-3 py-2.5 ${
          error ? "border-rose" : "border-dashed border-hairline focus:border-navy"
        }`}
      />

      {error && (
        <p className="mt-1.5 text-sm text-rose" id={errorId}>
          {error}
        </p>
      )}
    </div>
  );
}
