"use client";
import { useEffect } from "react";
import Link from "next/link";

/**
 * Next.js per-route error boundary. If anything inside /result throws
 * (e.g. malformed persona data, missing palette hexes, image decode
 * failure during render), this catches it instead of blanking the page.
 *
 * It also logs the error to the console so the user can see what happened
 * in DevTools, and offers a "Try again" reset + a path back to /brand.
 */
export default function ResultError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("[/result error boundary]", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-8">
      <div className="max-w-xl">
        <p className="eyebrow mb-6 text-ember">Something broke on this page</p>
        <h1 className="display text-5xl mb-6">
          We built your brand,
          <br />
          <span className="italic text-ember">but couldn't render it.</span>
        </h1>
        <p className="text-ash leading-relaxed mb-3">
          The generation finished, but the result view threw an error while
          drawing. This is almost always caused by an unexpected shape in the
          AI's response — usually a missing field in the persona or palette.
        </p>
        <p className="text-ash leading-relaxed mb-8 font-mono text-xs break-words">
          {error?.message || "unknown error"}
          {error?.digest && (
            <span className="block mt-2 text-ash/50">
              digest: {error.digest}
            </span>
          )}
        </p>
        <div className="flex flex-wrap gap-3">
          <button onClick={reset} className="btn">
            Try rendering again →
          </button>
          <Link href="/brand" className="btn btn-ghost">
            ← Back to wizard
          </Link>
        </div>
        <p className="mt-8 font-mono text-[11px] tracking-widest uppercase text-ash/60">
          Open DevTools (⌘+Opt+I / Ctrl+Shift+I) for the full stack trace.
        </p>
      </div>
    </div>
  );
}
