"use client";

type Props = {
  /** Eyebrow label above the refinement area, e.g. "Refine the directions". */
  label: string;
  /** Placeholder for the textarea. */
  placeholder: string;
  /** Current value of the refinement note. */
  value: string;
  /** Update the refinement note. */
  onChange: (v: string) => void;
  /** Submit handler — called when the user clicks the button or hits ⌘/Ctrl+Enter. */
  onSubmit: () => void;
  /** Disables inputs and shows a regenerating state. */
  busy: boolean;
  /** Error message to show; clicking "Retry" calls onSubmit again. */
  error: string | null;
  /** CTA label — defaults to "Regenerate". */
  ctaLabel?: string;
  /** Optional hint shown under the textarea. */
  hint?: string;
};

/**
 * A small, reusable refinement bar. Used at the bottom of step 6 (directions
 * & palette) and step 7 (typography) to let the user steer regeneration with
 * a free-form note.
 */
export default function RefineBar({
  label,
  placeholder,
  value,
  onChange,
  onSubmit,
  busy,
  error,
  ctaLabel = "Regenerate",
  hint,
}: Props) {
  return (
    <div className="mt-14 border-t border-steel pt-8 max-w-3xl">
      <p className="eyebrow mb-4">{label}</p>
      <div className="flex flex-col md:flex-row gap-4 md:items-start">
        <textarea
          className="field field-sm flex-1"
          rows={2}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            // ⌘+Enter / Ctrl+Enter submits, plain Enter leaves a newline.
            // Either way we stop propagation so StepShell's outer Enter-to-
            // continue handler doesn't ALSO fire and advance the wizard.
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              e.stopPropagation();
              if (!busy) onSubmit();
            } else if (e.key === "Enter") {
              e.stopPropagation();
            }
          }}
          placeholder={placeholder}
          disabled={busy}
          aria-label={label}
        />
        <button
          type="button"
          onClick={onSubmit}
          disabled={busy}
          className="btn btn-ghost shrink-0"
        >
          {busy ? "Regenerating…" : `${ctaLabel} →`}
        </button>
      </div>

      {hint && (
        <p className="mt-3 font-mono text-[10px] text-ash/60 tracking-[0.16em] uppercase">
          {hint}
        </p>
      )}

      {error && (
        <p
          role="alert"
          className="mt-4 font-mono text-xs text-ember tracking-wide"
        >
          {error}.{" "}
          <button
            type="button"
            onClick={onSubmit}
            className="underline hover:text-spark"
          >
            Retry
          </button>
        </p>
      )}
    </div>
  );
}
