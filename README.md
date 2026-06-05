# LIBRUM · BRANDER

> Your brand journey partner.

A creative platform that turns a few honest inputs into a complete brand or a complete campaign — voice, visuals, persona, essence, applied mockups, moodboard — composed in a dense bento reveal, exported as a printable playbook with every asset.

**Reasoned by Gemini · Rendered by Nano Banana (Gemini 2.5 Flash Image)**

---

## Brand identity

- **Name:** LIBRUM
- **Positioning:** BRANDER
- **Tagline:** Your brand journey partner
- **Palette:** noir #000000 · navy #0E1638 · spark #d4ff3d · magenta #ff2d8f · cyan #1fc9d7 · bone #f5f0e8
- **Display type:** Instrument Serif
- **Body type:** Geist
- **Mono:** JetBrains Mono

The Librum mark is a geometric L with a triangular flag extension at the top — sail/banner metaphor for "journey partner."

---

## Pick a path

1. **Brand from scratch** — 8 steps. Language → basics → audience & mission → archetype + voice (poster picker) → logo direction → direction & palette (with concept thumbnails + "More directions") → typography → review.
2. **Campaign from scratch** — 9 steps. Language → brand & logo upload → brief → target → archetype + voice (poster picker) → direction & palette → typography → channels → review.

The output is a **dense bento reveal**: hero lockup, brand essence list, logo variations, expanded color grid, Aa typography spec, iconography (flat + filled), 3 applied mockups, persona, pattern, **6-tile moodboard**, CTA/details. Every image tile is **regeneratable** on hover.

Then download the **complete playbook ZIP**: multi-page PDF + raw assets + color tokens + typography reference + JSON dump.

---

## Gemini integration

Vercel **does call the Gemini API** server-side from:

| Where | Model | What it does |
|---|---|---|
| `/api/reason` | `gemini-2.5-flash` | Brand & campaign suggestions, persona, more-palettes |
| `/api/image` | `gemini-2.5-flash-image` | Logo, concept thumbnails, mockups, moodboard, regen |
| `/api/health` | — | Reports `live: true` if `GEMINI_API_KEY` is set |

Visit `/api/health` after deploy to confirm. The badge on the landing page also turns green ("gemini live") when the key is detected, magenta ("mock mode") when it's not.

**Cost per full generation (with key):** ~3-4 Gemini text calls + ~13 Nano Banana calls (1 logo + 3 concept thumbnails + 3 mockups + 6 moodboard images), all parallelized within the 60s function timeout.

---

## Stack

- **Next.js 14** (App Router) — deployed to Vercel
- **Gemini 2.5 Flash** for reasoning
- **Gemini 2.5 Flash Image** for visuals + logo compositing
- **@react-pdf/renderer** for the PDF playbook (dynamically imported)
- **JSZip** for asset bundling
- **lucide-react** for the iconography tile
- **Tailwind CSS** + custom design system
- **Motion** for transitions
- **Zustand** for flow state (sessionStorage)

No Claude, no other engines — Gemini only, per spec.

---

## Local dev

```bash
npm install

# Optional — add your Gemini key (works without one)
cp .env.example .env.local
# paste your key from https://aistudio.google.com/apikey

npm run dev
```

Open http://localhost:3000 — the badge at the top will say "gemini live" or "mock mode."

---

## Deploy to Vercel

```bash
git init && git add . && git commit -m "init librum"
git remote add origin git@github.com:your/librum.git
git push -u origin main
# at vercel.com/new: import → add env var GEMINI_API_KEY → deploy
```

After deploy, hit `https://your.vercel.app/api/health` to verify:

```json
{
  "ok": true,
  "live": true,
  "text_model": "gemini-2.5-flash",
  "image_model": "gemini-2.5-flash-image",
  "timestamp": "2026-…"
}
```

If `"live": false` appears, the env var isn't set in Vercel. Add it under Project Settings → Environment Variables → `GEMINI_API_KEY` → Redeploy.

---

## Environment variables

| Key | Required | Default |
|---|---|---|
| `GEMINI_API_KEY` | No (mocks if absent) | — |
| `GEMINI_TEXT_MODEL` | No | `gemini-2.5-flash` |
| `GEMINI_IMAGE_MODEL` | No | `gemini-2.5-flash-image` |

---

## What's in the playbook ZIP

```
<name>-playbook.zip
├── README.md                          # plain-text summary
├── <name>-playbook.pdf                # multi-page A4 book (navy theme)
│   ├── Cover
│   ├── Essence + principles
│   ├── Story
│   ├── Logo (full bleed, white page)
│   ├── Colors (with usage notes)
│   ├── Typography (with samples)
│   ├── Persona (with traits + pattern)
│   ├── Moodboard (6-tile grid)
│   ├── Headlines + CTA (campaign only)
│   ├── Channels (campaign only)
│   └── Mockups (one full-bleed page each)
├── brand.json / campaign.json         # full data dump, re-importable
└── assets/
    ├── logo.png                       # raw logo file
    ├── mockup-01.png ... mockup-03.png
    ├── moodboard-01.png ... moodboard-06.png
    ├── concept-01-<name>.png ...      # all considered palette concepts
    ├── colors.css                     # CSS variables ready to paste
    ├── colors.json                    # palette tokens
    └── type.md                        # Google Fonts links + CSS vars
```

---

## File tree

```
librum/
├── app/
│   ├── api/
│   │   ├── reason/route.ts      # Gemini text — 6 reasoning kinds
│   │   ├── image/route.ts       # Nano Banana with input image support
│   │   └── health/route.ts      # Live status endpoint
│   ├── brand/page.tsx           # 8-step brand flow
│   ├── campaign/page.tsx        # 9-step campaign flow
│   ├── result/page.tsx          # Bento + playbook download
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                 # Landing with live badge
├── components/
│   ├── ArchetypePoster.tsx      # Image-based 12-archetype picker
│   ├── Bento.tsx                # Dense brand-book layout
│   ├── ChannelPicker.tsx
│   ├── LanguagePicker.tsx
│   ├── Logo.tsx                 # Librum mark + wordmark + BRANDER badge
│   ├── LogoStylePicker.tsx
│   ├── PalettePicker.tsx        # Horizontal layout, description beside, More button
│   ├── PlaybookPDF.tsx          # With essence + moodboard pages
│   ├── StepShell.tsx
│   ├── TonePicker.tsx
│   └── TypePicker.tsx
├── lib/
│   ├── archetype-visuals.ts     # Per-archetype color + symbol map
│   ├── archetypes.ts            # Jung's 12
│   ├── gemini.ts                # Server-side AI client + image input
│   ├── icon-library.tsx         # Client — lucide icon renderer
│   ├── icon-names.ts            # Server-safe icon name list
│   ├── languages.ts             # 12 supported languages
│   ├── mocks.ts                 # No-key fallback data
│   ├── playbook.ts              # Client-side ZIP packager
│   ├── prompts.ts               # Language-aware prompts (incl. more-palettes)
│   ├── store.ts                 # Zustand state
│   └── types.ts
├── tailwind.config.ts
├── next.config.js
├── vercel.json                  # 60s timeout for AI calls
└── package.json
```

---

## License

MIT
