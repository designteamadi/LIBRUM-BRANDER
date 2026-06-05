"use client";
import Link from "next/link";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import Logo from "@/components/Logo";

export default function Landing() {
  const [time, setTime] = useState("");
  const [live, setLive] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((j) => setLive(Boolean(j.live)))
      .catch(() => setLive(false));
  }, []);

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const offset = -d.getTimezoneOffset() / 60;
      setTime(
        `${String(d.getUTCHours()).padStart(2, "0")}:${String(
          d.getUTCMinutes()
        ).padStart(2, "0")} UTC${offset >= 0 ? "+" : ""}${offset}`
      );
    };
    tick();
    const id = setInterval(tick, 1000 * 30);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen relative">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-30 px-8 py-5 flex items-center justify-between bg-noir/70 backdrop-blur-md border-b border-steel/40">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-bone"
        >
          <Logo variant="full" markColor="#d4ff3d" textColor="#f5f0e8" />
        </motion.div>
        <motion.nav
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="hidden md:flex items-center gap-8 font-mono text-[11px] tracking-[0.18em] uppercase text-ash"
        >
          <a href="#how" className="link-underline hover:text-bone transition-colors">
            How it works
          </a>
          <a href="#features" className="link-underline hover:text-bone transition-colors">
            Features
          </a>
          <a href="#tech" className="link-underline hover:text-bone transition-colors">
            Tech
          </a>
        </motion.nav>
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="font-mono text-[11px] tracking-[0.18em] uppercase text-ash"
        >
          {time}
        </motion.div>
      </header>

      {/* Hero */}
      <section className="min-h-screen flex flex-col justify-center px-8 pt-24 pb-12 relative">
        <div className="max-w-7xl mx-auto w-full">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="eyebrow mb-8 flex items-center gap-4 flex-wrap"
          >
            <span className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 bg-spark rounded-full" />
              librum · brander v0.4
            </span>
            <span className="text-ash">·</span>
            <span
              className={`flex items-center gap-2 ${
                live === null
                  ? "text-ash"
                  : live
                  ? "text-spark"
                  : "text-magenta"
              }`}
            >
              <span
                className={`inline-block w-2 h-2 rounded-full ${
                  live === null
                    ? "bg-ash"
                    : live
                    ? "bg-spark animate-pulse"
                    : "bg-magenta"
                }`}
              />
              {live === null
                ? "checking gemini…"
                : live
                ? "gemini live"
                : "mock mode — set GEMINI_API_KEY"}
            </span>
          </motion.p>

          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="display text-[16vw] md:text-[12vw] leading-[0.82] mb-10"
          >
            Your brand
            <br />
            <span className="text-spark italic">journey</span>,
            <br />
            <span className="text-cyan italic">partner</span>.
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="max-w-xl text-lg md:text-xl text-ash leading-relaxed mb-16"
          >
            A complete brand or a complete campaign — voice, visuals, persona,
            applied mockups, moodboard — reasoned by Gemini, rendered by Nano
            Banana. Built for makers who'd rather ship than slide-deck.
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="flex items-center gap-6 font-mono text-[11px] tracking-[0.18em] uppercase text-ash"
          >
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-magenta rounded-full animate-pulse" />
              live
            </span>
            <span>↓ scroll to choose your path</span>
          </motion.div>
        </div>
      </section>

      {/* Path selector */}
      <section className="px-8 py-24 relative" id="how">
        <div className="max-w-7xl mx-auto">
          <p className="eyebrow mb-8">— pick one</p>
          <h2 className="display text-6xl md:text-8xl mb-16 max-w-4xl">
            Start from <span className="italic text-spark">zero</span>,
            <br />
            or start from a <span className="italic text-cyan">brand</span>.
          </h2>
        </div>

        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-3">
          <PathCard
            href="/brand"
            number="01"
            label="Create a brand"
            description="From scratch. Generate the lockup, palette, type, persona — the whole identity, ready to apply."
            steps={["language", "basics", "archetype", "logo", "palette", "type", "review"]}
            accent="spark"
          />
          <PathCard
            href="/campaign"
            number="02"
            label="Create a campaign"
            description="Already have a brand? Upload your logo and build a campaign on top — visuals, headlines, channel-ready ideas."
            steps={["language", "brief", "audience", "archetype", "palette", "type", "channels", "reveal"]}
            accent="magenta"
          />
        </div>
      </section>

      {/* How it works */}
      <section className="px-8 py-24 border-t border-steel/40" id="features">
        <div className="max-w-7xl mx-auto">
          <p className="eyebrow mb-8">— the work</p>
          <h2 className="display text-6xl md:text-8xl mb-20 max-w-4xl">
            Eight inputs.
            <br />
            <span className="italic text-spark">One coherent</span> output.
          </h2>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                n: "01",
                t: "Reason",
                b: "Gemini reads your inputs, weighs your archetype against your tone, and proposes three coherent directions — palette, type, story, pattern, mockup brief, moodboard.",
              },
              {
                n: "02",
                t: "Render",
                b: "Nano Banana turns the brief into photographic applied visuals — logo composited onto product, product in the world, the brand seen, not described.",
              },
              {
                n: "03",
                t: "Reveal",
                b: "A bento composition with every asset on one canvas. Tabs for the detail summary. One-click regen on any tile. Export pack when you're ready.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, delay: i * 0.1 }}
                className="border-t border-steel pt-6"
              >
                <p className="font-mono text-[11px] tracking-[0.2em] uppercase text-spark mb-4">
                  / {item.n}
                </p>
                <h3 className="display text-4xl mb-4">{item.t}</h3>
                <p className="text-ash leading-relaxed">{item.b}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Marquee */}
      <section className="border-y border-steel/40 py-8 overflow-hidden bg-navy">
        <div className="marquee-track display text-7xl">
          {Array.from({ length: 2 }).map((_, i) => (
            <span key={i} className="flex gap-16 items-center">
              <span>brand</span>
              <span className="text-spark italic">campaign</span>
              <span>persona</span>
              <span className="text-magenta italic">palette</span>
              <span>typography</span>
              <span className="text-cyan italic">mockups</span>
              <span>archetype</span>
              <span className="text-spark italic">voice</span>
            </span>
          ))}
        </div>
      </section>

      {/* Tech */}
      <section className="px-8 py-24" id="tech">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-end">
          <div>
            <p className="eyebrow mb-8">— under the hood</p>
            <h2 className="display text-6xl md:text-7xl leading-[0.9]">
              Reasoned by
              <br />
              <span className="italic text-spark">Gemini</span>.
              <br />
              Rendered by
              <br />
              <span className="italic text-spark">Nano Banana</span>.
            </h2>
          </div>
          <div className="space-y-6 text-ash text-lg leading-relaxed">
            <p>
              Every recommendation comes with reasoning. The model considers
              your archetype mix, audience, and tone before proposing colors,
              type, mockup directions, and moodboard — and explains why.
            </p>
            <p>
              Image generation is Gemini 2.5 Flash Image. Studio-quality
              visuals in seconds, composited with your wordmark and applied to
              real-world surfaces.
            </p>
            <p>Built for the long way. Open code, deployed on Vercel.</p>
          </div>
        </div>
      </section>

      {/* CTA footer */}
      <footer className="px-8 py-16 border-t border-steel/40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
          <div>
            <p className="display text-6xl md:text-8xl leading-none mb-6">
              Make
              <br />
              something.
            </p>
            <div className="flex gap-3">
              <Link href="/brand" className="btn">
                Start a brand →
              </Link>
              <Link href="/campaign" className="btn btn-ghost">
                Start a campaign →
              </Link>
            </div>
          </div>
          <div className="font-mono text-[11px] tracking-[0.18em] uppercase text-ash space-y-2 text-right">
            <p>LIBRUM · BRANDER © {new Date().getFullYear()}</p>
            <p>your brand journey partner</p>
            <p>v0.4</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function PathCard({
  href,
  number,
  label,
  description,
  steps,
  accent,
}: {
  href: string;
  number: string;
  label: string;
  description: string;
  steps: string[];
  accent: "spark" | "magenta";
}) {
  const accentClass = accent === "spark" ? "text-spark" : "text-magenta";
  const accentBorder = accent === "spark" ? "hover:border-spark" : "hover:border-magenta";

  return (
    <Link
      href={href}
      className={`group relative overflow-hidden p-10 md:p-12 border border-steel transition-all duration-500 ${accentBorder}`}
      style={{ background: "#0E1638" }}
    >
      <div className="flex items-start justify-between mb-16">
        <span className="font-mono text-[11px] tracking-[0.2em] uppercase text-ash">
          / {number}
        </span>
        <span className={`font-mono text-[11px] tracking-[0.2em] uppercase text-ash group-hover:${accentClass} transition-colors`}>
          enter →
        </span>
      </div>
      <h3
        className={`display text-6xl md:text-7xl mb-6 transition-colors group-hover:${accentClass}`}
      >
        {label}
      </h3>
      <p className="text-ash text-base md:text-lg leading-relaxed mb-12 max-w-md">
        {description}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {steps.map((s, i) => (
          <span
            key={i}
            className="font-mono text-[10px] tracking-widest uppercase px-2.5 py-1 border border-steel text-ash group-hover:border-ash transition-colors"
          >
            {String(i + 1).padStart(2, "0")} · {s}
          </span>
        ))}
      </div>
    </Link>
  );
}
