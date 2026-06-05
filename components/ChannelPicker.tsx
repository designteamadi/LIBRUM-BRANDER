"use client";
import type { MediaChannel } from "@/lib/types";

const CHANNELS: { key: MediaChannel; name: string }[] = [
  { key: "instagram", name: "Instagram" },
  { key: "tiktok", name: "TikTok" },
  { key: "youtube", name: "YouTube" },
  { key: "ooh", name: "Out-of-home" },
  { key: "print", name: "Print" },
  { key: "email", name: "Email" },
  { key: "web", name: "Web / landing" },
  { key: "radio", name: "Radio / audio" },
];

type Props = {
  selected: MediaChannel[];
  onToggle: (m: MediaChannel) => void;
};

export default function ChannelPicker({ selected, onToggle }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {CHANNELS.map((c) => {
        const on = selected.includes(c.key);
        return (
          <button
            key={c.key}
            onClick={() => onToggle(c.key)}
            className={`chip p-5 border text-left transition-all ${
              on ? "border-spark bg-spark/5" : "border-steel hover:border-ash"
            }`}
          >
            <p
              className={`display text-2xl ${on ? "text-spark" : "text-bone"}`}
            >
              {c.name}
            </p>
          </button>
        );
      })}
    </div>
  );
}
