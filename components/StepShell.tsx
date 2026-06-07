"use client";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { ReactNode, useEffect, useState } from "react";

type Props = {
  step: number;
  total: number;
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
  children: ReactNode;
  onNext?: () => void;
  onBack?: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  busy?: boolean;
  flowLabel: string;
};

export default function StepShell({
  step,
  total,
  eyebrow,
  title,
  subtitle,
  children,
  onNext,
  onBack,
  nextLabel = "Continue",
  nextDisabled,
  busy,
  flowLabel,
}: Props) {
  const pct = Math.round((step / total) * 100);

  // `mounted` lets us skip the entrance animation on the FIRST render only,
  // so SSR HTML is rendered with content visible (opacity:1) rather than
  // opacity:0. Without this, the page is blank if JS is slow or blocked.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Enter-to-continue keyboard shortcut. The handler is attached to the
  // outer container so React's synthetic event system handles propagation;
  // inputs/textareas/buttons inside can call e.stopPropagation() to opt out.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Enter") return;
    // Modifier-key combinations are reserved for explicit submits elsewhere
    // (e.g. ⌘+Enter inside RefineBar). Plain Enter only.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const target = e.target as HTMLElement | null;
    if (!target) return;
    // Textareas: Enter = newline. Buttons: Enter already activates them.
    // Contenteditable elements: hands-off.
    if (target instanceof HTMLTextAreaElement) return;
    if (target instanceof HTMLButtonElement) return;
    if (target.isContentEditable) return;
    if (nextDisabled || busy || !onNext) return;
    e.preventDefault();
    onNext();
  };

  return (
    <div
      className="min-h-screen relative"
      onKeyDown={handleKeyDown}
    >
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-30 px-8 py-6 flex items-center justify-between text-xs bg-noir/80 backdrop-blur-md border-b border-steel/40">
        <Link
          href="/"
          className="font-mono tracking-[0.18em] uppercase text-bone link-underline"
        >
          BRND
        </Link>
        <div className="flex items-center gap-6 font-mono text-ash uppercase tracking-[0.14em]">
          <span>{flowLabel}</span>
          <span>·</span>
          <span>
            {String(step).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        </div>
        <Link
          href="/"
          className="font-mono tracking-[0.14em] uppercase text-ash hover:text-bone transition-colors"
        >
          Exit
        </Link>
      </header>

      {/* Progress — initial={false} so SSR HTML shows the bar at its
          correct width instead of 0. On step change, motion animates from
          the previous width to the new one automatically. */}
      <div
        className="fixed top-[68px] left-0 right-0 z-30 h-px bg-steel/60"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Step ${step} of ${total}`}
      >
        <motion.div
          className="h-px bg-spark"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      {/* Content */}
      <main className="pt-32 pb-32 px-8 max-w-5xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            // SSR + first client render: skip initial animation so content
            // is visible immediately. Subsequent step changes animate normally.
            initial={mounted ? { opacity: 0, x: 24 } : false}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="eyebrow mb-6">{eyebrow}</p>
            <h1 className="display text-5xl md:text-7xl mb-4">{title}</h1>
            {subtitle && (
              <p className="text-ash text-lg max-w-2xl mb-12 leading-relaxed">
                {subtitle}
              </p>
            )}
            <div className="mt-10">{children}</div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom action bar */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 px-8 py-5 flex items-center justify-between bg-noir/80 backdrop-blur-md border-t border-steel/40">
        <button
          type="button"
          onClick={onBack}
          disabled={!onBack || busy}
          className="btn btn-ghost"
        >
          ← Back
        </button>
        <p className="hidden md:block text-ash text-xs font-mono uppercase tracking-[0.14em]">
          {busy ? "Thinking…" : "Press enter to continue"}
        </p>
        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled || !onNext || busy}
          className="btn"
        >
          {busy ? "Generating…" : nextLabel}
          {!busy && <span>→</span>}
        </button>
      </footer>
    </div>
  );
}
