"use client";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Svg,
  Polygon,
} from "@react-pdf/renderer";
import type {
  GeneratedBrand,
  GeneratedCampaign,
  ColorPalette,
  TypePairing,
  Persona,
  MediaChannel,
  BrandInput,
  CampaignInput,
} from "@/lib/types";
import { archetypeByKey } from "@/lib/archetypes";

// ============================================================
// Fonts
// ============================================================
// IMPORTANT: We deliberately use the PDF spec's 14 built-in "core fonts"
// (Helvetica, Times-Roman, Times-Italic, Times-Bold, etc.) instead of
// registering Google Fonts via Font.register().
//
// Why: the previous gstatic.com URLs rotted ("Failed to fetch font … 404")
// because Google rotates the hash-suffixed file paths whenever they bump
// a font version. The built-in core fonts are baked into every PDF reader
// since 1993 — they cannot 404, cannot rot, work offline, and embed at
// zero bundle cost. The visual tradeoff (Times-Italic vs. Instrument Serif)
// is worth the ironclad reliability for the downloadable deliverable.
//
// The on-screen Bento still uses the user's chosen Google fonts (those
// fetch from fonts.googleapis.com in the browser, which works fine).

const FONTS = {
  // Display: serif italic for the editorial brand-name-with-period moment
  displayItalic: "Times-Italic",
  display: "Times-Roman",
  displayBold: "Times-Bold",
  // Body: clean sans
  body: "Helvetica",
  bodyMedium: "Helvetica-Bold", // no medium in built-ins; bold is the closest
  bodyBold: "Helvetica-Bold",
  // Mono / caption
  mono: "Helvetica",
};

// ============================================================
// Tokens
// ============================================================
const COLORS = {
  noir: "#070707",
  ink: "#0d0d0e",
  steel: "#1f2128",
  ash: "#6b6b73",
  bone: "#f4f0e6",
  spark: "#c8ff3e",
  ember: "#ff6b35",
  magenta: "#ff3e8e",
};

// ============================================================
// Shared styles
// ============================================================
const styles = StyleSheet.create({
  // ----- page bases -----
  page: {
    backgroundColor: COLORS.noir,
    color: COLORS.bone,
    fontFamily: "Helvetica",
    padding: 56,
    fontSize: 10,
  },
  pageBone: {
    backgroundColor: COLORS.bone,
    color: COLORS.noir,
    fontFamily: "Helvetica",
    padding: 56,
    fontSize: 10,
  },
  pageInk: {
    backgroundColor: COLORS.ink,
    color: COLORS.bone,
    fontFamily: "Helvetica",
    padding: 56,
    fontSize: 10,
  },
  // ----- meta strips -----
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: COLORS.ash,
    marginBottom: 36,
  },
  footer: {
    position: "absolute",
    bottom: 32,
    left: 56,
    right: 56,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: COLORS.ash,
  },
  // ----- type system -----
  eyebrow: {
    fontSize: 8,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: COLORS.ash,
    marginBottom: 10,
  },
  eyebrowAccent: { color: COLORS.spark },
  hero: {
    fontFamily: "Times-Roman",
    fontSize: 84,
    lineHeight: 0.92,
    marginBottom: 14,
  },
  heroItalic: {
    fontFamily: "Times-Italic",
    color: COLORS.spark,
  },
  sectionLabel: {
    fontSize: 9,
    letterSpacing: 2.5,
    textTransform: "uppercase",
    color: COLORS.spark,
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: "Times-Roman",
    fontSize: 42,
    lineHeight: 1,
    marginBottom: 8,
  },
  sectionSub: {
    fontSize: 12,
    color: COLORS.ash,
    lineHeight: 1.5,
    marginBottom: 30,
    maxWidth: 380,
  },
  body: {
    fontSize: 10.5,
    lineHeight: 1.62,
    color: COLORS.bone,
    marginBottom: 12,
  },
  bodyMuted: {
    fontSize: 10,
    lineHeight: 1.55,
    color: COLORS.ash,
  },
  caption: {
    fontSize: 8,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    color: COLORS.ash,
    marginTop: 6,
  },
  // ----- layout primitives -----
  divider: {
    borderTopWidth: 0.5,
    borderTopColor: COLORS.steel,
    marginVertical: 18,
  },
  thinDivider: {
    borderTopWidth: 0.5,
    borderTopColor: COLORS.steel,
    marginVertical: 10,
  },
  row: { flexDirection: "row", gap: 16 },
  col: { flex: 1 },
  // ----- color system -----
  swatchRow: { flexDirection: "row", marginVertical: 8 },
  swatch: { flex: 1, height: 110, justifyContent: "flex-end", padding: 10 },
  swatchHex: { fontSize: 8, letterSpacing: 1, textTransform: "uppercase" },
  // ----- images -----
  bigImage: { width: "100%", height: 460, objectFit: "cover" },
  squareImage: { width: "100%", height: 280, objectFit: "cover" },
  thumbnail: { width: "100%", height: 120, objectFit: "cover" },
  // ----- tags / chips -----
  tag: {
    fontSize: 8,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    color: COLORS.spark,
    borderWidth: 0.5,
    borderColor: COLORS.spark,
    paddingVertical: 4,
    paddingHorizontal: 9,
    marginRight: 6,
    marginBottom: 6,
  },
  tagsWrap: { flexDirection: "row", flexWrap: "wrap", marginTop: 12 },
});

// ============================================================
// Helpers
// ============================================================
const contrastOn = (hex: string): string => {
  const c = (hex || "").replace("#", "");
  if (c.length !== 6) return "#f4f0e6";
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.55 ? "#0a0a0a" : "#f4f0e6";
};

const hexToRgb = (hex: string): string => {
  const c = (hex || "").replace("#", "");
  if (c.length !== 6) return "—";
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return `${r}, ${g}, ${b}`;
};

const cap = (s: string): string =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

// ============================================================
// Reusable PDF components
// ============================================================
const PageHeader = ({
  brand,
  section,
  pageNum,
  light,
}: {
  brand: string;
  section: string;
  pageNum: string;
  light?: boolean;
}) => (
  <View style={[styles.header, light ? { color: COLORS.ash } : {}]}>
    <Text>
      {brand} / {section}
    </Text>
    <Text>{pageNum}</Text>
  </View>
);

const PageFooter = ({
  brand,
  page,
  total,
  light,
}: {
  brand: string;
  page: number;
  total: number;
  light?: boolean;
}) => (
  <View style={[styles.footer, light ? { color: COLORS.ash } : {}]}>
    <Text>{brand}</Text>
    <Text>
      {String(page).padStart(2, "0")} / {String(total).padStart(2, "0")}
    </Text>
  </View>
);

// ============================================================
// Types
// ============================================================
type CommonProps = {
  name: string;
  archetypes: string;
  tone: string;
  palette: ColorPalette;
  type: TypePairing;
  persona: Persona;
  mockupImages: (string | undefined)[];
  conceptThumbnails: (string | undefined)[];
  logoImageDataUrl?: string;
  /** Nano Banana 2-generated editorial hero image for the cover. */
  coverImageDataUrl?: string;
  language: string;
};

type BrandPlaybookProps = CommonProps & {
  kind: "brand";
  industry: string;
  description: string;
  audience: string;
  mission: string;
  tagline: string;
  story: string;
  patternIdea: string;
  toneKeywords: string[];
  /** Six bad-usage logo transformations for the "Don't" page. */
  logoDontExamples: (string | undefined)[];
};

type CampaignPlaybookProps = CommonProps & {
  kind: "campaign";
  brandDescription: string;
  campaignName: string;
  campaignPurpose: string;
  campaignStory: string;
  targetMarket: string;
  channels: MediaChannel[];
  headlines: string[];
  cta: string;
  channelIdeas: Record<MediaChannel, string>;
  toneKeywords: string[];
};

// ============================================================
// BRAND PLAYBOOK — 17 pages
// ============================================================
export function BrandPlaybook(props: BrandPlaybookProps) {
  const p = props.palette;
  const hexes = p.hexes ?? ["#0a0a0a", "#c8ff3e", "#f5f0e8", "#ff3e8e"];
  const [c0, c1, c2, c3] = [
    hexes[0] || "#0a0a0a",
    hexes[1] || COLORS.spark,
    hexes[2] || COLORS.bone,
    hexes[3] || COLORS.magenta,
  ];
  const total = 17;

  // Derive 4 principles from tone keywords with safe defaults
  const tk = props.toneKeywords ?? [];
  const principles = [
    {
      word: tk[0] ?? "considered",
      desc: "How we move. Slow enough to be right, fast enough to be felt.",
    },
    {
      word: tk[1] ?? "deliberate",
      desc: "How we think. Every choice is a stance — nothing accidental.",
    },
    {
      word: tk[2] ?? "honest",
      desc: "How we speak. Plain words. No clever-for-clever's-sake.",
    },
    {
      word: tk[3] ?? "specific",
      desc: "How we ship. Generic loses. We make decisions and live with them.",
    },
  ];

  return (
    <Document
      title={`${props.name} — Brand Playbook`}
      author="BRND"
      subject="Brand Playbook"
    >
      {/* ============ 01 / COVER ============
          The cover is a designed editorial spread:
            - eyebrow strip at the top (publisher meta)
            - Nano Banana 2 generated hero image (full-width, ~50% of page)
            - logo lockup + brand name + italic tagline beneath
            - palette signature strip + meta block at the bottom
      */}
      <Page size="A4" style={styles.page}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Text style={styles.eyebrow}>BRND · brand playbook</Text>
          <Text style={styles.eyebrow}>v0.1 · {props.language}</Text>
        </View>

        {/* Nano Banana 2 generated editorial cover image */}
        {props.coverImageDataUrl ? (
          <View style={{ marginTop: 20, marginBottom: 24 }}>
            <Image
              src={props.coverImageDataUrl}
              style={{
                width: "100%",
                height: 380,
                objectFit: "cover",
              }}
            />
            <Text
              style={{
                fontSize: 7,
                letterSpacing: 1.6,
                textTransform: "uppercase",
                color: COLORS.ash,
                marginTop: 6,
                textAlign: "right",
                fontFamily: "Times-Italic",
              }}
            >
              cover · generated by nano banana 2
            </Text>
          </View>
        ) : (
          // Fallback: bold accent panel with typographic brand name if
          // the Nano Banana 2 cover image isn't ready yet. No triangle.
          <View
            style={{
              marginTop: 20,
              marginBottom: 24,
              height: 380,
              backgroundColor: c1,
              alignItems: "center",
              justifyContent: "center",
              padding: 40,
            }}
          >
            <Text
              style={{
                fontFamily: "Times-Roman",
                fontSize: 96,
                lineHeight: 0.9,
                color: contrastOn(c1),
                textAlign: "center",
              }}
            >
              {props.name}
              <Text style={{ fontFamily: "Times-Italic" }}>.</Text>
            </Text>
          </View>
        )}

        {/* Logo lockup — show the actual logo if we have one. If not,
            the brand name typography below stands alone as the wordmark.
            No triangle fallback. */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 16,
            marginTop: 4,
          }}
        >
          {props.logoImageDataUrl && (
            <Image
              src={props.logoImageDataUrl}
              style={{
                width: 60,
                height: 60,
                objectFit: "contain",
              }}
            />
          )}
          <Text style={[styles.hero, { fontSize: 64 }]}>
            {props.name}
            <Text style={styles.heroItalic}>.</Text>
          </Text>
        </View>

        {props.tagline ? (
          <Text
            style={{
              fontFamily: "Times-Italic",
              fontSize: 22,
              marginTop: 10,
              color: COLORS.ash,
              maxWidth: 440,
              lineHeight: 1.15,
            }}
          >
            {props.tagline}
          </Text>
        ) : null}

        {/* Cover palette signature */}
        <View
          style={{
            position: "absolute",
            bottom: 100,
            left: 56,
            right: 56,
            flexDirection: "row",
            height: 8,
          }}
        >
          {hexes.map((h) => (
            <View key={h} style={{ flex: 1, backgroundColor: h }} />
          ))}
        </View>

        <View style={{ position: "absolute", bottom: 56, left: 56, right: 56 }}>
          <View style={styles.divider} />
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.eyebrow}>archetypes</Text>
              <Text style={styles.body}>{props.archetypes}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.eyebrow}>industry</Text>
              <Text style={styles.body}>{props.industry || "—"}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.eyebrow}>palette</Text>
              <Text style={styles.body}>{p.name}</Text>
            </View>
          </View>
        </View>
      </Page>

      {/* ============ 02 / CONTENTS ============ */}
      <Page size="A4" style={styles.page}>
        <PageHeader
          brand={props.name}
          section="contents"
          pageNum="02 / 17"
        />
        <Text style={styles.sectionLabel}>navigation</Text>
        <Text style={styles.sectionTitle}>Contents.</Text>
        <View style={{ marginTop: 28 }}>
          {[
            ["01", "Cover"],
            ["02", "Contents"],
            ["03", "Brand essence"],
            ["04", "Mission & audience"],
            ["05", "Story"],
            ["06", "The mark"],
            ["07", "Logo system"],
            ["08", "Logo — don't"],
            ["09", "Color system"],
            ["10", "Color hierarchy"],
            ["11", "Typography specimen"],
            ["12", "Typography hierarchy"],
            ["13", "Voice & persona"],
            ["14", "Voice — do / don't"],
            ["15", "Pattern & texture"],
            ["16", "In action"],
            ["17", "At a glance"],
          ].map(([num, title]) => (
            <View
              key={num}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingVertical: 8,
                borderBottomWidth: 0.5,
                borderBottomColor: COLORS.steel,
              }}
            >
              <Text
                style={{
                  fontSize: 8,
                  letterSpacing: 2,
                  color: COLORS.ash,
                  width: 30,
                }}
              >
                {num}
              </Text>
              <Text
                style={{
                  fontFamily: "Times-Roman",
                  fontSize: 22,
                  flex: 1,
                  marginLeft: 16,
                  color: COLORS.bone,
                }}
              >
                {title}
              </Text>
            </View>
          ))}
        </View>
        <PageFooter brand={props.name} page={2} total={total} />
      </Page>

      {/* ============ 03 / BRAND ESSENCE ============ */}
      <Page size="A4" style={styles.page}>
        <PageHeader brand={props.name} section="essence" pageNum="03 / 17" />
        <Text style={styles.sectionLabel}>03 — what we believe</Text>
        <Text style={styles.sectionTitle}>Brand essence.</Text>
        <Text style={styles.sectionSub}>
          Four principles that govern every decision — design, copy, product,
          hiring. Read them before you write a single word in our name.
        </Text>
        {principles.map((pr, i) => (
          <View
            key={i}
            style={{
              flexDirection: "row",
              gap: 18,
              paddingTop: 16,
              paddingBottom: 16,
              borderTopWidth: 0.5,
              borderTopColor: COLORS.steel,
            }}
          >
            <View
              style={{
                width: 56,
                height: 56,
                backgroundColor:
                  i === 0
                    ? c1
                    : i === 1
                    ? COLORS.ember
                    : i === 2
                    ? c3
                    : COLORS.bone,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontFamily: "Times-Roman",
                  fontSize: 30,
                  color: contrastOn(
                    i === 0
                      ? c1
                      : i === 1
                      ? COLORS.ember
                      : i === 2
                      ? c3
                      : COLORS.bone
                  ),
                }}
              >
                0{i + 1}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: "Times-Roman",
                  fontSize: 26,
                  color: COLORS.bone,
                  marginBottom: 6,
                }}
              >
                {cap(pr.word)}.
              </Text>
              <Text style={styles.bodyMuted}>{pr.desc}</Text>
            </View>
          </View>
        ))}
        <PageFooter brand={props.name} page={3} total={total} />
      </Page>

      {/* ============ 04 / MISSION & AUDIENCE ============ */}
      <Page size="A4" style={styles.page}>
        <PageHeader brand={props.name} section="mission" pageNum="04 / 17" />
        <Text style={styles.sectionLabel}>04 — why we exist</Text>
        <Text style={styles.sectionTitle}>Mission.</Text>
        <Text style={styles.sectionSub}>
          The single statement that justifies every product decision we'll ever
          make.
        </Text>
        <Text
          style={{
            fontFamily: "Times-Roman",
            fontSize: 28,
            lineHeight: 1.2,
            color: COLORS.bone,
            marginBottom: 32,
            maxWidth: 480,
          }}
        >
          "{props.mission || "—"}"
        </Text>

        <View style={styles.divider} />

        <Text style={styles.sectionLabel}>who it's for</Text>
        <Text style={[styles.body, { marginTop: 4 }]}>
          {props.audience || "—"}
        </Text>

        <View style={styles.divider} />

        <View style={styles.row}>
          <View style={styles.col}>
            <Text style={styles.eyebrow}>what we do</Text>
            <Text style={styles.body}>{props.description || "—"}</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.eyebrow}>industry</Text>
            <Text style={styles.body}>{props.industry || "—"}</Text>
          </View>
        </View>
        <PageFooter brand={props.name} page={4} total={total} />
      </Page>

      {/* ============ 05 / STORY ============ */}
      <Page size="A4" style={styles.page}>
        <PageHeader brand={props.name} section="story" pageNum="05 / 17" />
        <Text style={styles.sectionLabel}>05 — narrative</Text>
        <Text style={styles.sectionTitle}>Story.</Text>
        <Text style={styles.sectionSub}>
          The origin and conviction in one paragraph — for press, about pages,
          and the first sentence of any pitch.
        </Text>
        <Text
          style={{
            fontFamily: "Times-Roman",
            fontSize: 16,
            lineHeight: 1.55,
            color: COLORS.bone,
            maxWidth: 500,
          }}
        >
          {props.story || "—"}
        </Text>

        <View style={{ position: "absolute", bottom: 100, left: 56, right: 56 }}>
          <View style={styles.divider} />
          <Text style={styles.eyebrow}>tone keywords</Text>
          <View style={styles.tagsWrap}>
            {props.tone
              .split("·")
              .map((t) => t.trim())
              .filter(Boolean)
              .map((t) => (
                <Text key={t} style={styles.tag}>
                  {t}
                </Text>
              ))}
          </View>
        </View>
        <PageFooter brand={props.name} page={5} total={total} />
      </Page>

      {/* ============ 06 / LOGO / THE MARK (white bg) ============ */}
      <Page size="A4" style={styles.pageBone}>
        <PageHeader brand={props.name} section="lockup" pageNum="06 / 17" light />
        <Text style={[styles.sectionLabel, { color: COLORS.magenta }]}>
          06 — primary lockup
        </Text>
        <Text style={[styles.sectionTitle, { color: COLORS.noir }]}>
          The mark.
        </Text>
        <Text
          style={[
            styles.sectionSub,
            { color: COLORS.ash, marginBottom: 40 },
          ]}
        >
          The primary application. Use this version on light backgrounds when
          space allows. Maintain at least 1× cap-height of clear space on all
          sides.
        </Text>

        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            height: 320,
            marginTop: 20,
            borderWidth: 0.5,
            borderColor: COLORS.steel,
            borderStyle: "dashed",
          }}
        >
          {props.logoImageDataUrl ? (
            <Image
              src={props.logoImageDataUrl}
              style={{
                maxWidth: "60%",
                maxHeight: "80%",
                objectFit: "contain",
              }}
            />
          ) : (
            // No logo image — show the brand name as the wordmark.
            <Text
              style={{
                fontFamily: "Times-Roman",
                fontSize: 80,
                lineHeight: 1,
                color: COLORS.noir,
              }}
            >
              {props.name}
              <Text
                style={{
                  fontFamily: "Times-Italic",
                  color: COLORS.magenta,
                }}
              >
                .
              </Text>
            </Text>
          )}
        </View>

        <View style={{ flexDirection: "row", marginTop: 20, gap: 24 }}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.eyebrow, { color: COLORS.ash }]}>
              minimum width
            </Text>
            <Text style={{ color: COLORS.noir, fontSize: 11 }}>32px digital / 12mm print</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.eyebrow, { color: COLORS.ash }]}>
              clear space
            </Text>
            <Text style={{ color: COLORS.noir, fontSize: 11 }}>1× cap-height all sides</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.eyebrow, { color: COLORS.ash }]}>
              file formats
            </Text>
            <Text style={{ color: COLORS.noir, fontSize: 11 }}>SVG · PNG (transparent)</Text>
          </View>
        </View>

        <PageFooter brand={props.name} page={6} total={total} light />
      </Page>

      {/* ============ 07 / LOGO SYSTEM (variations) ============ */}
      <Page size="A4" style={styles.page}>
        <PageHeader
          brand={props.name}
          section="logo system"
          pageNum="07 / 17"
        />
        <Text style={styles.sectionLabel}>07 — variations</Text>
        <Text style={styles.sectionTitle}>Logo system.</Text>
        <Text style={styles.sectionSub}>
          Four authorized variants. Pick the one with sufficient contrast on
          your background. Never recolor outside this system.
        </Text>

        <View
          style={{
            flexDirection: "row",
            gap: 10,
            marginTop: 8,
            marginBottom: 18,
          }}
        >
          <LogoCard
            bg={c0}
            label="primary · dark"
            caption="default"
            logo={props.logoImageDataUrl}
            accent={c1}
            wordmarkText={props.name}
          />
          <LogoCard
            bg={c2}
            label="inverted · light"
            caption="for light surfaces"
            logo={props.logoImageDataUrl}
            accent={c0}
            wordmarkText={props.name}
          />
        </View>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <LogoCard
            bg={c1}
            label="accent"
            caption="for hi-impact moments"
            logo={props.logoImageDataUrl}
            accent={c0}
            wordmarkText={props.name}
          />
          <LogoCard
            bg="transparent"
            label="monochrome"
            caption="emergency / 1-color use"
            logo={props.logoImageDataUrl}
            accent={c2}
            outline
            wordmarkText={props.name}
          />
        </View>

        <PageFooter brand={props.name} page={7} total={total} />
      </Page>

      {/* ============ 08 / LOGO DON'TS ============
          Real Nano Banana 2-generated examples of bad logo usage.
          Each card shows the actual logo transformed in the wrong way,
          paired with a red "X" mark and a label. If a specific example
          failed to generate, fall back to a magenta block + cross. */}
      <Page size="A4" style={styles.page}>
        <PageHeader brand={props.name} section="logo / dont" pageNum="08 / 17" />
        <Text style={styles.sectionLabel}>08 — rules</Text>
        <Text style={styles.sectionTitle}>Don't.</Text>
        <Text style={styles.sectionSub}>
          Six ways to destroy the mark. Each example below is a real,
          deliberate violation — generated for reference, never to be repeated.
        </Text>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          {[
            { label: "Don't stretch", note: "Preserve original ratio." },
            { label: "Don't rotate", note: "Always sit on the baseline." },
            { label: "Don't recolor", note: "Stick to the authorized variants." },
            { label: "Don't outline", note: "No strokes, no shadows, no glow." },
            { label: "Don't crowd", note: "Respect the clear-space rule." },
            { label: "Don't pattern", note: "No patterns or images inside the mark." },
          ].map((rule, i) => {
            const exampleImg = props.logoDontExamples?.[i];
            return (
              <View
                key={i}
                style={{
                  width: "31.5%",
                  borderWidth: 0.5,
                  borderColor: COLORS.steel,
                  marginBottom: 8,
                  overflow: "hidden",
                }}
              >
                {/* Image area showing the bad example */}
                <View
                  style={{
                    height: 130,
                    backgroundColor: "#15161a",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  {exampleImg ? (
                    <Image
                      src={exampleImg}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <View
                      style={{
                        width: 56,
                        height: 56,
                        backgroundColor: COLORS.magenta,
                      }}
                    />
                  )}
                  {/* "X" badge — diagonal corner stamp */}
                  <View
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      width: 26,
                      height: 26,
                      backgroundColor: COLORS.magenta,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: COLORS.noir,
                        fontFamily: "Helvetica-Bold",
                        fontSize: 14,
                      }}
                    >
                      ✕
                    </Text>
                  </View>
                </View>
                {/* Caption */}
                <View style={{ padding: 12 }}>
                  <Text
                    style={{
                      color: COLORS.bone,
                      fontSize: 11,
                      fontFamily: "Helvetica-Bold",
                      marginBottom: 3,
                    }}
                  >
                    {rule.label}.
                  </Text>
                  <Text
                    style={{
                      color: COLORS.ash,
                      fontSize: 9,
                      lineHeight: 1.45,
                    }}
                  >
                    {rule.note}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
        <PageFooter brand={props.name} page={8} total={total} />
      </Page>

      {/* ============ 09 / COLOR SYSTEM ============ */}
      <Page size="A4" style={styles.page}>
        <PageHeader brand={props.name} section="color" pageNum="09 / 17" />
        <Text style={styles.sectionLabel}>09 — palette · {p.name}</Text>
        <Text style={styles.sectionTitle}>Color system.</Text>
        <Text style={styles.sectionSub}>{p.rationale || "Our color system."}</Text>

        {[c0, c1, c2, c3].map((h, i) => {
          const role = ["base", "accent", "surface", "pop"][i];
          const text = contrastOn(h);
          return (
            <View
              key={h + i}
              style={{
                flexDirection: "row",
                marginBottom: 8,
                height: 76,
              }}
            >
              <View
                style={{
                  flex: 2,
                  backgroundColor: h,
                  padding: 14,
                  justifyContent: "space-between",
                }}
              >
                <Text
                  style={{
                    fontSize: 8,
                    letterSpacing: 1.6,
                    textTransform: "uppercase",
                    color: text,
                    opacity: 0.7,
                  }}
                >
                  {role}
                </Text>
                <Text
                  style={{
                    fontFamily: "Times-Roman",
                    fontSize: 22,
                    color: text,
                  }}
                >
                  {h.toUpperCase()}
                </Text>
              </View>
              <View
                style={{
                  flex: 3,
                  backgroundColor: COLORS.ink,
                  padding: 14,
                  borderRightWidth: 0.5,
                  borderTopWidth: 0.5,
                  borderBottomWidth: 0.5,
                  borderRightColor: COLORS.steel,
                  borderTopColor: COLORS.steel,
                  borderBottomColor: COLORS.steel,
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 8,
                    letterSpacing: 1.6,
                    textTransform: "uppercase",
                    color: COLORS.ash,
                    marginBottom: 4,
                  }}
                >
                  rgb · {hexToRgb(h)} · usage {i === 1 ? "5%" : i === 3 ? "8%" : i === 0 ? "60%" : "27%"}
                </Text>
                <Text style={{ color: COLORS.bone, fontSize: 10.5, lineHeight: 1.5 }}>
                  {i === 0 &&
                    "Foundational surface. Backgrounds, hero typography on light surfaces."}
                  {i === 1 &&
                    "Signature accent. Reserve for moments — CTAs, key headlines, never paragraphs."}
                  {i === 2 &&
                    "Negative space. Inverted backgrounds, supporting type, marketing surfaces."}
                  {i === 3 && "Punctuation. Used sparingly — error states, alerts, single emphasis."}
                </Text>
              </View>
            </View>
          );
        })}

        <PageFooter brand={props.name} page={9} total={total} />
      </Page>

      {/* ============ 10 / COLOR HIERARCHY ============ */}
      <Page size="A4" style={styles.page}>
        <PageHeader brand={props.name} section="color hierarchy" pageNum="10 / 17" />
        <Text style={styles.sectionLabel}>10 — proportions</Text>
        <Text style={styles.sectionTitle}>Hierarchy.</Text>
        <Text style={styles.sectionSub}>
          The 60·27·8·5 rule. When in doubt, lean toward more base, less accent.
        </Text>

        <View style={{ flexDirection: "row", height: 220, marginTop: 8 }}>
          <View
            style={{
              flex: 60,
              backgroundColor: c0,
              padding: 14,
              justifyContent: "flex-end",
            }}
          >
            <Text
              style={{
                fontFamily: "Times-Roman",
                fontSize: 56,
                color: contrastOn(c0),
              }}
            >
              60%
            </Text>
            <Text
              style={{
                fontSize: 8,
                letterSpacing: 1.6,
                color: contrastOn(c0),
                opacity: 0.7,
              }}
            >
              base
            </Text>
          </View>
          <View
            style={{
              flex: 27,
              backgroundColor: c2,
              padding: 14,
              justifyContent: "flex-end",
            }}
          >
            <Text
              style={{
                fontFamily: "Times-Roman",
                fontSize: 42,
                color: contrastOn(c2),
              }}
            >
              27%
            </Text>
            <Text
              style={{
                fontSize: 8,
                letterSpacing: 1.6,
                color: contrastOn(c2),
                opacity: 0.7,
              }}
            >
              surface
            </Text>
          </View>
          <View
            style={{
              flex: 8,
              backgroundColor: c3,
              padding: 10,
              justifyContent: "flex-end",
            }}
          >
            <Text
              style={{
                fontFamily: "Times-Roman",
                fontSize: 22,
                color: contrastOn(c3),
              }}
            >
              8%
            </Text>
            <Text
              style={{
                fontSize: 7,
                letterSpacing: 1.6,
                color: contrastOn(c3),
                opacity: 0.7,
              }}
            >
              pop
            </Text>
          </View>
          <View
            style={{
              flex: 5,
              backgroundColor: c1,
              padding: 10,
              justifyContent: "flex-end",
            }}
          >
            <Text
              style={{
                fontFamily: "Times-Roman",
                fontSize: 22,
                color: contrastOn(c1),
              }}
            >
              5%
            </Text>
            <Text
              style={{
                fontSize: 7,
                letterSpacing: 1.6,
                color: contrastOn(c1),
                opacity: 0.7,
              }}
            >
              accent
            </Text>
          </View>
        </View>

        <View style={[styles.row, { marginTop: 28 }]}>
          <View style={styles.col}>
            <Text style={styles.eyebrow}>do</Text>
            <Text style={styles.bodyMuted}>
              Let the base carry the page. Use accent for moments that earn a
              second look — buttons, key numbers, the one headline that matters.
            </Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.eyebrow}>don't</Text>
            <Text style={styles.bodyMuted}>
              Flood the surface with accent — it stops working when overused.
              Avoid placing accent next to pop without breathing room.
            </Text>
          </View>
        </View>

        <PageFooter brand={props.name} page={10} total={total} />
      </Page>

      {/* ============ 11 / TYPOGRAPHY SPECIMEN ============ */}
      <Page size="A4" style={styles.page}>
        <PageHeader brand={props.name} section="type" pageNum="11 / 17" />
        <Text style={styles.sectionLabel}>11 — specimen</Text>
        <Text style={styles.sectionTitle}>Typography.</Text>
        <Text style={styles.sectionSub}>{props.type.rationale}</Text>

        <View
          style={{
            marginTop: 14,
            paddingTop: 18,
            borderTopWidth: 0.5,
            borderTopColor: COLORS.steel,
          }}
        >
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.eyebrow}>display · {props.type.display}</Text>
              <Text
                style={{
                  fontFamily: "Times-Roman",
                  fontSize: 130,
                  lineHeight: 0.92,
                  marginTop: 4,
                  color: COLORS.bone,
                }}
              >
                Aa
              </Text>
              <Text
                style={{
                  fontFamily: "Times-Roman",
                  fontSize: 36,
                  lineHeight: 1,
                  marginTop: 8,
                  color: COLORS.spark,
                }}
              >
                Rr 0–9
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.eyebrow}>body · {props.type.body}</Text>
              <Text
                style={{
                  fontFamily: "Helvetica",
                  fontSize: 10.5,
                  lineHeight: 1.65,
                  marginTop: 4,
                  color: COLORS.bone,
                }}
              >
                The quick brown fox jumps over the lazy dog. We design for
                density and rhythm — text that reads first as shape, then as
                content. Set tight, but never cramped. Body sets at 10.5–12pt
                for print, 16–18px for web.
              </Text>
              <View style={{ marginTop: 16 }}>
                <Text style={[styles.eyebrow, { marginBottom: 8 }]}>character set</Text>
                <Text
                  style={{
                    fontFamily: "Helvetica",
                    fontSize: 9,
                    lineHeight: 1.5,
                    color: COLORS.ash,
                  }}
                >
                  ABCDEFGHIJKLMNOPQRSTUVWXYZ{"\n"}
                  abcdefghijklmnopqrstuvwxyz{"\n"}
                  0 1 2 3 4 5 6 7 8 9{"\n"}
                  ! @ # $ % & * ( ) ? .
                </Text>
              </View>
            </View>
          </View>
        </View>

        <PageFooter brand={props.name} page={11} total={total} />
      </Page>

      {/* ============ 12 / TYPOGRAPHY HIERARCHY ============ */}
      <Page size="A4" style={styles.page}>
        <PageHeader brand={props.name} section="type hierarchy" pageNum="12 / 17" />
        <Text style={styles.sectionLabel}>12 — scale</Text>
        <Text style={styles.sectionTitle}>Hierarchy.</Text>
        <Text style={styles.sectionSub}>
          A six-step scale. Anything outside this scale is a bug, not a feature.
        </Text>

        <View style={{ marginTop: 18 }}>
          {[
            { label: "H1 · Display", font: "Times-Roman", size: 56, sample: props.name + "." },
            { label: "H2 · Section", font: "Times-Roman", size: 32, sample: "Section title here." },
            { label: "H3 · Subsection", font: "Helvetica", size: 18, sample: "Subsection title", weight: 500 },
            { label: "Body large", font: "Helvetica", size: 14, sample: "Lead paragraph or feature text.", weight: 400 },
            { label: "Body", font: "Helvetica", size: 11, sample: "Regular paragraph copy at 11pt with 1.6 leading.", weight: 400 },
            { label: "Caption / mono", font: "Helvetica", size: 9, sample: "EYEBROW · CAPTION · TABULAR LABEL", weight: 500 },
          ].map((s, i) => (
            <View
              key={i}
              style={{
                flexDirection: "row",
                alignItems: "baseline",
                paddingVertical: 9,
                borderBottomWidth: 0.5,
                borderBottomColor: COLORS.steel,
              }}
            >
              <Text
                style={{
                  width: 110,
                  fontSize: 8,
                  letterSpacing: 1.4,
                  textTransform: "uppercase",
                  color: COLORS.ash,
                }}
              >
                {s.label}
              </Text>
              <Text
                style={{
                  flex: 1,
                  fontFamily: s.font,
                  fontSize: s.size,
                  lineHeight: 1.15,
                  color: i === 0 ? COLORS.spark : COLORS.bone,
                }}
              >
                {s.sample}
              </Text>
              <Text
                style={{
                  fontSize: 8,
                  letterSpacing: 1.4,
                  color: COLORS.ash,
                  width: 50,
                  textAlign: "right",
                }}
              >
                {s.size}pt
              </Text>
            </View>
          ))}
        </View>

        <PageFooter brand={props.name} page={12} total={total} />
      </Page>

      {/* ============ 13 / VOICE & PERSONA ============ */}
      <Page size="A4" style={styles.page}>
        <PageHeader brand={props.name} section="voice" pageNum="13 / 17" />
        <Text style={styles.sectionLabel}>13 — who we sound like</Text>
        <Text style={styles.sectionTitle}>{props.persona.name}.</Text>
        <Text style={styles.sectionSub}>
          Our voice is one character — not a committee, not a brand book vibe.
          When you write for us, write as them.
        </Text>

        <Text
          style={{
            fontFamily: "Times-Roman",
            fontSize: 16,
            lineHeight: 1.55,
            color: COLORS.bone,
            maxWidth: 500,
            marginTop: 8,
            marginBottom: 18,
          }}
        >
          {props.persona.description}
        </Text>

        <Text style={[styles.eyebrow, styles.eyebrowAccent]}>traits</Text>
        <View style={styles.tagsWrap}>
          {props.persona.traits.map((t) => (
            <Text key={t} style={styles.tag}>
              {t}
            </Text>
          ))}
        </View>

        <View style={[styles.divider, { marginTop: 30 }]} />
        <Text style={styles.eyebrow}>archetypal foundation</Text>
        <Text style={styles.body}>{props.archetypes}</Text>

        <PageFooter brand={props.name} page={13} total={total} />
      </Page>

      {/* ============ 14 / VOICE DO / DON'T ============ */}
      <Page size="A4" style={styles.page}>
        <PageHeader brand={props.name} section="voice / do dont" pageNum="14 / 17" />
        <Text style={styles.sectionLabel}>14 — voice rules</Text>
        <Text style={styles.sectionTitle}>Do / Don't.</Text>
        <Text style={styles.sectionSub}>
          Voice is the easiest thing to break. Three side-by-side rules to keep
          you on key.
        </Text>

        {[
          {
            doText: "Lead with the thing. Then earn the second sentence.",
            dontText: "Open with a vague promise (\"In a world where…\").",
          },
          {
            doText: "Use specific, concrete nouns. Names. Numbers. Places.",
            dontText: "Hide behind buzzwords. \"Synergize, leverage, ideate.\"",
          },
          {
            doText: "Write at the reading level of an honest letter to a friend.",
            dontText: "Inflate to sound smart. Long sentences with no spine.",
          },
        ].map((rule, i) => (
          <View
            key={i}
            style={{
              flexDirection: "row",
              gap: 12,
              paddingVertical: 16,
              borderTopWidth: 0.5,
              borderTopColor: COLORS.steel,
            }}
          >
            <View
              style={{
                flex: 1,
                padding: 12,
                borderLeftWidth: 3,
                borderLeftColor: COLORS.spark,
              }}
            >
              <Text style={[styles.eyebrow, styles.eyebrowAccent]}>do</Text>
              <Text
                style={{
                  fontFamily: "Times-Roman",
                  fontSize: 14,
                  lineHeight: 1.4,
                  color: COLORS.bone,
                  marginTop: 4,
                }}
              >
                {rule.doText}
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                padding: 12,
                borderLeftWidth: 3,
                borderLeftColor: COLORS.magenta,
              }}
            >
              <Text style={[styles.eyebrow, { color: COLORS.magenta }]}>don't</Text>
              <Text
                style={{
                  fontFamily: "Times-Italic",
                  fontSize: 14,
                  lineHeight: 1.4,
                  color: COLORS.ash,
                  
                  marginTop: 4,
                }}
              >
                {rule.dontText}
              </Text>
            </View>
          </View>
        ))}

        <PageFooter brand={props.name} page={14} total={total} />
      </Page>

      {/* ============ 15 / PATTERN & TEXTURE ============ */}
      <Page size="A4" style={styles.page}>
        <PageHeader brand={props.name} section="pattern" pageNum="15 / 17" />
        <Text style={styles.sectionLabel}>15 — signature pattern</Text>
        <Text style={styles.sectionTitle}>Pattern.</Text>
        <Text style={styles.sectionSub}>{props.patternIdea || "Our signature texture."}</Text>

        <View
          style={{
            height: 320,
            backgroundColor: c1,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Svg width="100%" height="100%" viewBox="0 0 600 320">
            {/* Manual pattern fill — render a grid of triangles */}
            {Array.from({ length: 12 }).map((_, row) =>
              Array.from({ length: 22 }).map((__, col) => {
                const x = col * 28;
                const y = row * 28;
                return (
                  <Polygon
                    key={`${row}-${col}`}
                    points={`${x + 14},${y + 4} ${x + 24},${y + 22} ${x + 4},${y + 22}`}
                    fill="none"
                    stroke={c0}
                    strokeWidth="1.2"
                  />
                );
              })
            )}
          </Svg>
        </View>

        <View style={[styles.row, { marginTop: 18 }]}>
          <View style={styles.col}>
            <Text style={styles.eyebrow}>usage · background</Text>
            <Text style={styles.bodyMuted}>
              Tile at any scale, but maintain a single hue. Pattern fills should
              never compete with the foreground content.
            </Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.eyebrow}>usage · cropping</Text>
            <Text style={styles.bodyMuted}>
              Use the single repeat as a cropping device — a "window" through
              which to frame a photo or hero composition.
            </Text>
          </View>
        </View>

        <PageFooter brand={props.name} page={15} total={total} />
      </Page>

      {/* ============ 16 / IN ACTION ============ */}
      {props.mockupImages.filter(Boolean).slice(0, 3).map((img, i) => (
        <Page key={`mock-${i}`} size="A4" style={styles.page}>
          <PageHeader
            brand={props.name}
            section={`in action · ${String(i + 1).padStart(2, "0")}`}
            pageNum={`${16}.${i + 1} / 17`}
          />
          <Text style={styles.sectionLabel}>
            16.{i + 1} — applied · context {["primary", "secondary", "tertiary"][i]}
          </Text>
          <Text style={styles.sectionTitle}>In action.</Text>
          {img && <Image src={img} style={styles.bigImage} />}
          <Text
            style={{
              fontSize: 9,
              color: COLORS.ash,
              marginTop: 12,
              letterSpacing: 0.4,
              
              fontFamily: "Helvetica-Oblique",
            }}
          >
            {i === 0
              ? "Hero application — full-bleed brand expression."
              : i === 1
              ? "Secondary application — product or context-in-use."
              : "Tertiary application — lifestyle / brand-in-world."}
          </Text>
          <PageFooter brand={props.name} page={16} total={total} />
        </Page>
      ))}

      {/* ============ 17 / CLOSING BENTOBOX ============
          A single-page visual summary of everything in the book — like
          the on-screen Bento, condensed to one printable spread.
          Replaces the old moodboard + built-by + file-pack page. */}
      <Page size="A4" style={styles.page}>
        <PageHeader brand={props.name} section="summary" pageNum="17 / 17" />
        <Text style={styles.sectionLabel}>17 — at a glance</Text>
        <Text style={styles.sectionTitle}>The system.</Text>
        <Text style={[styles.sectionSub, { marginBottom: 16 }]}>
          Everything in this book, in one view. Tear this out, pin it up,
          ship from it.
        </Text>

        {/* === Bentobox grid === */}
        {/* Row 1 — Hero lockup (full width) */}
        <View
          style={{
            backgroundColor: c0,
            padding: 16,
            marginBottom: 6,
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
            height: 100,
            borderWidth: 0.5,
            borderColor: COLORS.steel,
          }}
        >
          {props.logoImageDataUrl && (
            <Image
              src={props.logoImageDataUrl}
              style={{
                width: 56,
                height: 56,
                objectFit: "contain",
              }}
            />
          )}
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: "Times-Roman",
                fontSize: 36,
                lineHeight: 1,
                color: contrastOn(c0),
              }}
            >
              {props.name}
              <Text style={{ color: c1 }}>.</Text>
            </Text>
            {props.tagline ? (
              <Text
                style={{
                  fontFamily: "Times-Italic",
                  fontSize: 11,
                  color: contrastOn(c0),
                  opacity: 0.7,
                  marginTop: 4,
                }}
              >
                {props.tagline}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Row 2 — Color · Typography · Persona */}
        <View style={{ flexDirection: "row", gap: 6, marginBottom: 6, height: 130 }}>
          {/* Color cell */}
          <View
            style={{
              flex: 1,
              borderWidth: 0.5,
              borderColor: COLORS.steel,
              backgroundColor: COLORS.ink,
              padding: 10,
            }}
          >
            <Text style={[styles.eyebrow, { marginBottom: 8 }]}>color</Text>
            <View
              style={{ flexDirection: "row", flexWrap: "wrap", gap: 2, marginBottom: 8 }}
            >
              {hexes.slice(0, 4).map((h) => (
                <View
                  key={h}
                  style={{
                    width: "48%",
                    height: 26,
                    backgroundColor: h,
                  }}
                />
              ))}
            </View>
            <Text
              style={{
                fontSize: 8,
                color: COLORS.ash,
                letterSpacing: 0.5,
              }}
            >
              {p.name}
            </Text>
          </View>

          {/* Typography cell */}
          <View
            style={{
              flex: 1,
              borderWidth: 0.5,
              borderColor: COLORS.steel,
              backgroundColor: COLORS.ink,
              padding: 10,
              justifyContent: "space-between",
            }}
          >
            <Text style={styles.eyebrow}>type</Text>
            <Text
              style={{
                fontFamily: "Times-Roman",
                fontSize: 56,
                lineHeight: 0.92,
                color: COLORS.bone,
              }}
            >
              Aa
            </Text>
            <View>
              <Text
                style={{
                  fontSize: 8,
                  color: COLORS.bone,
                  fontFamily: "Helvetica-Bold",
                }}
              >
                {props.type.display}
              </Text>
              <Text style={{ fontSize: 8, color: COLORS.ash }}>
                / {props.type.body}
              </Text>
            </View>
          </View>

          {/* Persona cell */}
          <View
            style={{
              flex: 1,
              borderWidth: 0.5,
              borderColor: c1,
              backgroundColor: COLORS.ink,
              padding: 10,
              justifyContent: "space-between",
            }}
          >
            <Text style={[styles.eyebrow, { color: c1 }]}>persona</Text>
            <Text
              style={{
                fontFamily: "Times-Roman",
                fontSize: 18,
                lineHeight: 1.05,
                color: COLORS.bone,
              }}
            >
              {props.persona.name}
            </Text>
            <Text
              style={{
                fontSize: 8,
                color: COLORS.ash,
                lineHeight: 1.4,
              }}
            >
              {(props.persona.traits || []).slice(0, 4).join(" · ")}
            </Text>
          </View>
        </View>

        {/* Row 3 — Pattern + Essence (4 principles compressed) */}
        <View style={{ flexDirection: "row", gap: 6, marginBottom: 6, height: 130 }}>
          {/* Pattern strip */}
          <View
            style={{
              flex: 1,
              backgroundColor: c1,
              padding: 10,
              position: "relative",
              overflow: "hidden",
            }}
          >
            <Svg
              width="100%"
              height="100%"
              viewBox="0 0 200 130"
              style={{ position: "absolute", top: 0, left: 0 }}
            >
              {Array.from({ length: 5 }).map((_, row) =>
                Array.from({ length: 8 }).map((__, col) => {
                  const x = col * 26;
                  const y = row * 26;
                  return (
                    <Polygon
                      key={`${row}-${col}`}
                      points={`${x + 13},${y + 4} ${x + 22},${y + 22} ${x + 4},${y + 22}`}
                      fill="none"
                      stroke={c0}
                      strokeWidth="1"
                    />
                  );
                })
              )}
            </Svg>
            <Text
              style={{
                fontSize: 8,
                letterSpacing: 1.6,
                textTransform: "uppercase",
                color: contrastOn(c1),
                opacity: 0.7,
                position: "relative",
              }}
            >
              pattern
            </Text>
          </View>

          {/* Essence — 4 principles compact */}
          <View
            style={{
              flex: 2,
              borderWidth: 0.5,
              borderColor: COLORS.steel,
              backgroundColor: COLORS.ink,
              padding: 12,
            }}
          >
            <Text style={[styles.eyebrow, { marginBottom: 8 }]}>essence</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {principles.map((pr, i) => (
                <View
                  key={i}
                  style={{
                    width: "47%",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <View
                    style={{
                      width: 22,
                      height: 22,
                      backgroundColor:
                        i === 0 ? c1 : i === 1 ? COLORS.ember : i === 2 ? c3 : COLORS.bone,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: "Times-Roman",
                        fontSize: 11,
                        color: contrastOn(
                          i === 0 ? c1 : i === 1 ? COLORS.ember : i === 2 ? c3 : COLORS.bone
                        ),
                      }}
                    >
                      0{i + 1}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontFamily: "Times-Roman",
                      fontSize: 12,
                      color: COLORS.bone,
                      textTransform: "capitalize",
                    }}
                  >
                    {pr.word}.
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Row 4 — Hero mockup (full width if available) */}
        {props.mockupImages.filter(Boolean)[0] && (
          <View
            style={{
              height: 160,
              marginBottom: 6,
              backgroundColor: COLORS.ink,
              borderWidth: 0.5,
              borderColor: COLORS.steel,
              overflow: "hidden",
            }}
          >
            <Image
              src={props.mockupImages.filter(Boolean)[0]!}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </View>
        )}

        {/* Closing line */}
        <View
          style={{
            position: "absolute",
            bottom: 56,
            left: 56,
            right: 56,
          }}
        >
          <View style={styles.thinDivider} />
          <Text
            style={{
              fontFamily: "Times-Italic",
              fontSize: 20,
              color: COLORS.spark,
              textAlign: "center",
              marginTop: 6,
            }}
          >
            — end of book —
          </Text>
        </View>

        <PageFooter brand={props.name} page={17} total={total} />
      </Page>
    </Document>
  );
}

// ============================================================
// LOGO CARD (used on page 07)
// ============================================================
function LogoCard({
  bg,
  label,
  caption,
  logo,
  accent,
  outline,
  wordmarkText,
  wordmarkFont,
}: {
  bg: string;
  label: string;
  caption: string;
  logo?: string;
  accent: string;
  outline?: boolean;
  /** Fallback wordmark text shown when no logo image is available. */
  wordmarkText?: string;
  /** Font for the fallback wordmark — usually the chosen display font. */
  wordmarkFont?: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: bg === "transparent" ? COLORS.ink : bg,
        borderWidth: outline ? 0.5 : 0,
        borderColor: outline ? COLORS.steel : "transparent",
        borderStyle: outline ? "dashed" : "solid",
        height: 200,
        padding: 14,
        justifyContent: "space-between",
      }}
    >
      <Text
        style={{
          fontSize: 8,
          letterSpacing: 1.6,
          textTransform: "uppercase",
          color: outline ? COLORS.ash : contrastOn(bg),
          opacity: 0.7,
        }}
      >
        {label}
      </Text>
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {logo ? (
          <Image
            src={logo}
            style={{
              maxWidth: "75%",
              maxHeight: "85%",
              objectFit: "contain",
              opacity: outline ? 0.7 : 1,
            }}
          />
        ) : (
          // No logo image — render the wordmark in display type instead.
          // Auto-scale so it fits within the card.
          <Text
            style={{
              fontFamily: "Times-Roman",
              fontSize:
                wordmarkText && wordmarkText.length > 12
                  ? 18
                  : wordmarkText && wordmarkText.length > 7
                  ? 24
                  : 32,
              lineHeight: 1,
              color: outline ? COLORS.ash : contrastOn(bg),
              textAlign: "center",
              maxWidth: "85%",
            }}
          >
            {wordmarkText || "—"}
            {wordmarkText && (
              <Text style={{ color: accent }}>.</Text>
            )}
          </Text>
        )}
      </View>
      <Text
        style={{
          fontSize: 8,
          letterSpacing: 1.6,
          textTransform: "uppercase",
          color: outline ? COLORS.ash : contrastOn(bg),
          opacity: 0.5,
          textAlign: "right",
        }}
      >
        {caption}
      </Text>
    </View>
  );
}

// ============================================================
// CAMPAIGN PLAYBOOK — 14 pages
// ============================================================
export function CampaignPlaybook(props: CampaignPlaybookProps) {
  const p = props.palette;
  const hexes = p.hexes ?? ["#0a0a0a", "#c8ff3e", "#f5f0e8", "#ff3e8e"];
  const [c0, c1, c2, c3] = [
    hexes[0] || "#0a0a0a",
    hexes[1] || COLORS.spark,
    hexes[2] || COLORS.bone,
    hexes[3] || COLORS.magenta,
  ];
  const total = 14;
  const cName = props.campaignName || "Campaign";

  return (
    <Document
      title={`${cName} — Campaign Playbook`}
      author="BRND"
      subject="Campaign Playbook"
    >
      {/* ============ 01 / COVER ============
          Designed cover with Nano Banana 2 hero image and parent-brand
          logo lockup. */}
      <Page size="A4" style={styles.page}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Text style={styles.eyebrow}>BRND · campaign playbook</Text>
          <Text style={styles.eyebrow}>v0.1 · {props.language}</Text>
        </View>

        {/* Nano Banana 2 generated editorial cover image */}
        {props.coverImageDataUrl ? (
          <View style={{ marginTop: 20, marginBottom: 24 }}>
            <Image
              src={props.coverImageDataUrl}
              style={{
                width: "100%",
                height: 380,
                objectFit: "cover",
              }}
            />
            <Text
              style={{
                fontSize: 7,
                letterSpacing: 1.6,
                textTransform: "uppercase",
                color: COLORS.ash,
                marginTop: 6,
                textAlign: "right",
                fontFamily: "Times-Italic",
              }}
            >
              cover · generated by nano banana 2
            </Text>
          </View>
        ) : (
          <View
            style={{
              marginTop: 20,
              marginBottom: 24,
              height: 380,
              backgroundColor: c1,
              alignItems: "center",
              justifyContent: "center",
              padding: 40,
            }}
          >
            <Text
              style={{
                fontFamily: "Helvetica-Bold",
                fontSize: 72,
                lineHeight: 0.92,
                letterSpacing: -1.5,
                color: contrastOn(c1),
                textAlign: "center",
              }}
            >
              {cName}
              <Text style={{ fontFamily: "Times-Italic" }}>.</Text>
            </Text>
          </View>
        )}

        {/* Parent brand logo + "campaign for" + campaign name */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            marginTop: 4,
          }}
        >
          {props.logoImageDataUrl && (
            <Image
              src={props.logoImageDataUrl}
              style={{
                width: 38,
                height: 38,
                objectFit: "contain",
              }}
            />
          )}
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 8,
                letterSpacing: 1.6,
                textTransform: "uppercase",
                color: COLORS.ash,
                marginBottom: 2,
              }}
            >
              campaign · for {props.name}
            </Text>
            <Text
              style={{
                fontFamily: "Helvetica-Bold",
                fontSize: 48,
                lineHeight: 0.95,
                letterSpacing: -1,
                color: COLORS.bone,
              }}
            >
              {cName}
              <Text style={{ color: c1 }}>.</Text>
            </Text>
          </View>
        </View>

        <View
          style={{
            position: "absolute",
            bottom: 100,
            left: 56,
            right: 56,
            flexDirection: "row",
            height: 8,
          }}
        >
          {hexes.map((h) => (
            <View key={h} style={{ flex: 1, backgroundColor: h }} />
          ))}
        </View>

        <View style={{ position: "absolute", bottom: 56, left: 56, right: 56 }}>
          <View style={styles.divider} />
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.eyebrow}>archetypes</Text>
              <Text style={styles.body}>{props.archetypes}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.eyebrow}>palette</Text>
              <Text style={styles.body}>{p.name}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.eyebrow}>channels</Text>
              <Text style={styles.body}>{props.channels.join(" · ")}</Text>
            </View>
          </View>
        </View>
      </Page>

      {/* ============ 02 / CONTENTS ============ */}
      <Page size="A4" style={styles.page}>
        <PageHeader brand={cName} section="contents" pageNum="02 / 14" />
        <Text style={styles.sectionLabel}>navigation</Text>
        <Text style={styles.sectionTitle}>Contents.</Text>
        <View style={{ marginTop: 28 }}>
          {[
            ["01", "Cover"],
            ["02", "Contents"],
            ["03", "The brief"],
            ["04", "Audience"],
            ["05", "Voice"],
            ["06", "Voice — do / don't"],
            ["07", "Headlines"],
            ["08", "Call to action"],
            ["09", "Color"],
            ["10", "Typography"],
            ["11", "Channel activations"],
            ["12", "Visual · 01"],
            ["13", "Visual · 02"],
            ["14", "Closing"],
          ].map(([num, title]) => (
            <View
              key={num}
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingVertical: 8,
                borderBottomWidth: 0.5,
                borderBottomColor: COLORS.steel,
              }}
            >
              <Text style={{ fontSize: 8, letterSpacing: 2, color: COLORS.ash, width: 30 }}>
                {num}
              </Text>
              <Text style={{ fontFamily: "Times-Roman", fontSize: 22, flex: 1, marginLeft: 16, color: COLORS.bone }}>
                {title}
              </Text>
            </View>
          ))}
        </View>
        <PageFooter brand={cName} page={2} total={total} />
      </Page>

      {/* ============ 03 / THE BRIEF ============ */}
      <Page size="A4" style={styles.page}>
        <PageHeader brand={cName} section="brief" pageNum="03 / 14" />
        <Text style={styles.sectionLabel}>03 — the assignment</Text>
        <Text style={styles.sectionTitle}>The brief.</Text>
        <Text style={styles.sectionSub}>
          One paragraph each — purpose, story, brand. The single source of truth
          for everything that follows.
        </Text>

        <View style={[styles.divider, { marginTop: 6 }]} />
        <Text style={styles.eyebrow}>brand</Text>
        <Text style={styles.body}>{props.brandDescription}</Text>
        <View style={styles.thinDivider} />
        <Text style={styles.eyebrow}>purpose</Text>
        <Text style={styles.body}>{props.campaignPurpose}</Text>
        <View style={styles.thinDivider} />
        <Text style={styles.eyebrow}>story</Text>
        <Text
          style={{
            fontFamily: "Times-Roman",
            fontSize: 18,
            lineHeight: 1.45,
            color: COLORS.bone,
            marginTop: 4,
            marginBottom: 12,
          }}
        >
          {props.campaignStory}
        </Text>

        <PageFooter brand={cName} page={3} total={total} />
      </Page>

      {/* ============ 04 / AUDIENCE ============ */}
      <Page size="A4" style={styles.page}>
        <PageHeader brand={cName} section="audience" pageNum="04 / 14" />
        <Text style={styles.sectionLabel}>04 — who needs to hear this</Text>
        <Text style={styles.sectionTitle}>Audience.</Text>
        <Text style={styles.sectionSub}>
          Not a segment. A person. We write for them, not at them.
        </Text>
        <Text
          style={{
            fontFamily: "Times-Roman",
            fontSize: 18,
            lineHeight: 1.5,
            color: COLORS.bone,
            maxWidth: 520,
            marginTop: 6,
          }}
        >
          {props.targetMarket}
        </Text>
        <PageFooter brand={cName} page={4} total={total} />
      </Page>

      {/* ============ 05 / VOICE ============ */}
      <Page size="A4" style={styles.page}>
        <PageHeader brand={cName} section="voice" pageNum="05 / 14" />
        <Text style={styles.sectionLabel}>05 — who we sound like</Text>
        <Text style={styles.sectionTitle}>{props.persona.name}.</Text>
        <Text
          style={{
            fontFamily: "Times-Roman",
            fontSize: 16,
            lineHeight: 1.55,
            color: COLORS.bone,
            maxWidth: 500,
            marginTop: 8,
            marginBottom: 18,
          }}
        >
          {props.persona.description}
        </Text>

        <Text style={[styles.eyebrow, styles.eyebrowAccent]}>traits</Text>
        <View style={styles.tagsWrap}>
          {props.persona.traits.map((t) => (
            <Text key={t} style={styles.tag}>
              {t}
            </Text>
          ))}
        </View>

        <View style={[styles.divider, { marginTop: 30 }]} />
        <Text style={styles.eyebrow}>archetypal foundation</Text>
        <Text style={styles.body}>{props.archetypes}</Text>
        <PageFooter brand={cName} page={5} total={total} />
      </Page>

      {/* ============ 06 / VOICE DO/DON'T ============ */}
      <Page size="A4" style={styles.page}>
        <PageHeader brand={cName} section="voice / do dont" pageNum="06 / 14" />
        <Text style={styles.sectionLabel}>06 — voice rules</Text>
        <Text style={styles.sectionTitle}>Do / Don't.</Text>
        <Text style={styles.sectionSub}>
          Voice is the easiest thing to break. Three rules.
        </Text>

        {[
          {
            doText: "Open with the single idea. The rest serves that line.",
            dontText: "Start with setup. \"In a world where…\"",
          },
          {
            doText: "Be specific. Names, numbers, places, products.",
            dontText: "Hide in buzzwords. Synergize. Leverage. Ideate.",
          },
          {
            doText: "Trust the reader. They get there in half the words you think.",
            dontText: "Over-explain. If you have to caveat, you're not done.",
          },
        ].map((rule, i) => (
          <View
            key={i}
            style={{
              flexDirection: "row",
              gap: 12,
              paddingVertical: 16,
              borderTopWidth: 0.5,
              borderTopColor: COLORS.steel,
            }}
          >
            <View
              style={{ flex: 1, padding: 12, borderLeftWidth: 3, borderLeftColor: COLORS.spark }}
            >
              <Text style={[styles.eyebrow, styles.eyebrowAccent]}>do</Text>
              <Text
                style={{
                  fontFamily: "Times-Roman",
                  fontSize: 14,
                  lineHeight: 1.4,
                  color: COLORS.bone,
                  marginTop: 4,
                }}
              >
                {rule.doText}
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                padding: 12,
                borderLeftWidth: 3,
                borderLeftColor: COLORS.magenta,
              }}
            >
              <Text style={[styles.eyebrow, { color: COLORS.magenta }]}>don't</Text>
              <Text
                style={{
                  fontFamily: "Times-Italic",
                  fontSize: 14,
                  lineHeight: 1.4,
                  color: COLORS.ash,
                  
                  marginTop: 4,
                }}
              >
                {rule.dontText}
              </Text>
            </View>
          </View>
        ))}
        <PageFooter brand={cName} page={6} total={total} />
      </Page>

      {/* ============ 07 / HEADLINES ============ */}
      <Page size="A4" style={styles.page}>
        <PageHeader brand={cName} section="headlines" pageNum="07 / 14" />
        <Text style={styles.sectionLabel}>07 — messaging</Text>
        <Text style={styles.sectionTitle}>Headlines.</Text>
        <Text style={styles.sectionSub}>
          The hero line first. The rest are alternates — pick by channel, pick by mood.
        </Text>

        {props.headlines.map((h, i) => (
          <View
            key={i}
            style={{
              flexDirection: "row",
              alignItems: "baseline",
              paddingVertical: 12,
              borderBottomWidth: 0.5,
              borderBottomColor: COLORS.steel,
            }}
          >
            <Text
              style={{
                fontSize: 8,
                letterSpacing: 1.6,
                color: COLORS.ash,
                width: 32,
              }}
            >
              {String(i + 1).padStart(2, "0")}
            </Text>
            <Text
              style={{
                fontFamily: "Times-Roman",
                fontSize: i === 0 ? 36 : 24,
                lineHeight: 1.1,
                color: i === 0 ? COLORS.spark : COLORS.bone,
                flex: 1,
              }}
            >
              {h}
            </Text>
          </View>
        ))}

        <PageFooter brand={cName} page={7} total={total} />
      </Page>

      {/* ============ 08 / CTA ============ */}
      <Page size="A4" style={styles.page}>
        <PageHeader brand={cName} section="cta" pageNum="08 / 14" />
        <Text style={styles.sectionLabel}>08 — primary call to action</Text>
        <Text style={styles.sectionTitle}>The ask.</Text>
        <Text style={styles.sectionSub}>
          One line. One action. Used identically across channels.
        </Text>

        <View
          style={{
            backgroundColor: c1,
            paddingVertical: 80,
            paddingHorizontal: 40,
            marginTop: 24,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              fontFamily: "Times-Roman",
              fontSize: 64,
              lineHeight: 1,
              color: contrastOn(c1),
              textAlign: "center",
            }}
          >
            {props.cta || "—"}
          </Text>
        </View>

        <View style={[styles.row, { marginTop: 24 }]}>
          <View style={styles.col}>
            <Text style={styles.eyebrow}>use on</Text>
            <Text style={styles.bodyMuted}>Accent surface ({c1.toUpperCase()}) only.</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.eyebrow}>display type</Text>
            <Text style={styles.bodyMuted}>{props.type.display}, set tight.</Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.eyebrow}>placement</Text>
            <Text style={styles.bodyMuted}>End frame · footer · primary button.</Text>
          </View>
        </View>

        <PageFooter brand={cName} page={8} total={total} />
      </Page>

      {/* ============ 09 / COLOR ============ */}
      <Page size="A4" style={styles.page}>
        <PageHeader brand={cName} section="color" pageNum="09 / 14" />
        <Text style={styles.sectionLabel}>09 — palette · {p.name}</Text>
        <Text style={styles.sectionTitle}>Color.</Text>
        <Text style={styles.sectionSub}>{p.rationale}</Text>
        <View style={styles.swatchRow}>
          {hexes.map((h) => (
            <View key={h} style={[styles.swatch, { backgroundColor: h }]}>
              <Text style={[styles.swatchHex, { color: contrastOn(h) }]}>{h}</Text>
            </View>
          ))}
        </View>
        <View style={[styles.divider, { marginTop: 20 }]} />
        <Text style={styles.eyebrow}>application</Text>
        <Text style={styles.body}>
          Reserve {c1.toUpperCase()} for moments — CTAs, key numbers, never paragraphs.
          {" "}{c0.toUpperCase()} carries foundational surfaces. {c2.toUpperCase()} earns the negative space.
          {" "}{c3.toUpperCase()} is punctuation, not paragraphs.
        </Text>
        <PageFooter brand={cName} page={9} total={total} />
      </Page>

      {/* ============ 10 / TYPE ============ */}
      <Page size="A4" style={styles.page}>
        <PageHeader brand={cName} section="type" pageNum="10 / 14" />
        <Text style={styles.sectionLabel}>10 — type system</Text>
        <Text style={styles.sectionTitle}>Typography.</Text>
        <Text style={styles.sectionSub}>{props.type.rationale}</Text>

        <View style={[styles.row, { marginTop: 12 }]}>
          <View style={styles.col}>
            <Text style={styles.eyebrow}>display · {props.type.display}</Text>
            <Text
              style={{
                fontFamily: "Times-Roman",
                fontSize: 110,
                lineHeight: 0.92,
                marginTop: 6,
                color: COLORS.bone,
              }}
            >
              Aa
            </Text>
          </View>
          <View style={styles.col}>
            <Text style={styles.eyebrow}>body · {props.type.body}</Text>
            <Text
              style={{
                fontFamily: "Helvetica",
                fontSize: 11,
                lineHeight: 1.62,
                marginTop: 8,
                color: COLORS.bone,
              }}
            >
              {props.persona.description}
            </Text>
          </View>
        </View>

        <PageFooter brand={cName} page={10} total={total} />
      </Page>

      {/* ============ 11 / CHANNEL ACTIVATIONS ============ */}
      <Page size="A4" style={styles.page}>
        <PageHeader brand={cName} section="channels" pageNum="11 / 14" />
        <Text style={styles.sectionLabel}>11 — channel-by-channel</Text>
        <Text style={styles.sectionTitle}>Channel activations.</Text>
        <Text style={styles.sectionSub}>
          One idea per channel. Adapt the line, never the message.
        </Text>

        {Object.entries(props.channelIdeas)
          .filter(([, v]) => v && v.length > 0)
          .map(([ch, idea]) => (
            <View
              key={ch}
              style={{
                paddingTop: 14,
                paddingBottom: 14,
                borderTopWidth: 0.5,
                borderTopColor: COLORS.steel,
                flexDirection: "row",
                gap: 16,
              }}
            >
              <View
                style={{
                  width: 96,
                  paddingTop: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 9,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    color: COLORS.spark,
                  }}
                >
                  {ch}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: "Helvetica",
                    fontSize: 11,
                    lineHeight: 1.6,
                    color: COLORS.bone,
                  }}
                >
                  {idea}
                </Text>
              </View>
            </View>
          ))}

        <PageFooter brand={cName} page={11} total={total} />
      </Page>

      {/* ============ 12-13 / VISUALS ============ */}
      {props.mockupImages.filter(Boolean).slice(0, 2).map((img, i) => (
        <Page key={`viz-${i}`} size="A4" style={styles.page}>
          <PageHeader
            brand={cName}
            section={`visual · ${String(i + 1).padStart(2, "0")}`}
            pageNum={`${12 + i} / 14`}
          />
          <Text style={styles.sectionLabel}>
            {12 + i} — applied · {i === 0 ? "primary" : "secondary"}
          </Text>
          <Text style={styles.sectionTitle}>In action.</Text>
          {img && <Image src={img} style={styles.bigImage} />}
          <PageFooter brand={cName} page={12 + i} total={total} />
        </Page>
      ))}

      {/* ============ 14 / CLOSING BENTOBOX ============
          A single-page visual summary of the campaign — mirror of the
          brand-book closing page. */}
      <Page size="A4" style={styles.page}>
        <PageHeader brand={cName} section="summary" pageNum="14 / 14" />
        <Text style={styles.sectionLabel}>14 — at a glance</Text>
        <Text style={styles.sectionTitle}>The campaign.</Text>
        <Text style={[styles.sectionSub, { marginBottom: 16 }]}>
          Everything in this campaign book, in one view. Pin it up and run.
        </Text>

        {/* Row 1 — Hero lockup */}
        <View
          style={{
            backgroundColor: c0,
            padding: 16,
            marginBottom: 6,
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
            height: 100,
            borderWidth: 0.5,
            borderColor: COLORS.steel,
          }}
        >
          {props.logoImageDataUrl && (
            <Image
              src={props.logoImageDataUrl}
              style={{
                width: 42,
                height: 42,
                objectFit: "contain",
              }}
            />
          )}
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 8,
                letterSpacing: 1.6,
                textTransform: "uppercase",
                color: contrastOn(c0),
                opacity: 0.6,
                marginBottom: 2,
              }}
            >
              for {props.name}
            </Text>
            <Text
              style={{
                fontFamily: "Helvetica-Bold",
                fontSize: 32,
                lineHeight: 0.95,
                letterSpacing: -1,
                color: contrastOn(c0),
              }}
            >
              {cName}
              <Text style={{ color: c1 }}>.</Text>
            </Text>
          </View>
        </View>

        {/* Row 2 — Color · Type · CTA */}
        <View style={{ flexDirection: "row", gap: 6, marginBottom: 6, height: 130 }}>
          <View
            style={{
              flex: 1,
              borderWidth: 0.5,
              borderColor: COLORS.steel,
              backgroundColor: COLORS.ink,
              padding: 10,
            }}
          >
            <Text style={[styles.eyebrow, { marginBottom: 8 }]}>color</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 2, marginBottom: 8 }}>
              {hexes.slice(0, 4).map((h) => (
                <View
                  key={h}
                  style={{
                    width: "48%",
                    height: 26,
                    backgroundColor: h,
                  }}
                />
              ))}
            </View>
            <Text style={{ fontSize: 8, color: COLORS.ash, letterSpacing: 0.5 }}>
              {p.name}
            </Text>
          </View>

          <View
            style={{
              flex: 1,
              borderWidth: 0.5,
              borderColor: COLORS.steel,
              backgroundColor: COLORS.ink,
              padding: 10,
              justifyContent: "space-between",
            }}
          >
            <Text style={styles.eyebrow}>type</Text>
            <Text
              style={{
                fontFamily: "Times-Roman",
                fontSize: 56,
                lineHeight: 0.92,
                color: COLORS.bone,
              }}
            >
              Aa
            </Text>
            <View>
              <Text
                style={{
                  fontSize: 8,
                  color: COLORS.bone,
                  fontFamily: "Helvetica-Bold",
                }}
              >
                {props.type.display}
              </Text>
              <Text style={{ fontSize: 8, color: COLORS.ash }}>
                / {props.type.body}
              </Text>
            </View>
          </View>

          {/* CTA cell */}
          <View
            style={{
              flex: 1,
              backgroundColor: c3,
              padding: 10,
              justifyContent: "space-between",
            }}
          >
            <Text
              style={[
                styles.eyebrow,
                { color: contrastOn(c3), opacity: 0.7 },
              ]}
            >
              cta
            </Text>
            <Text
              style={{
                fontFamily: "Times-Roman",
                fontSize: 22,
                lineHeight: 1,
                color: contrastOn(c3),
              }}
            >
              {(props.cta || "—").length > 40
                ? (props.cta || "").slice(0, 38) + "…"
                : props.cta || "—"}
            </Text>
            <Text
              style={{
                fontSize: 7,
                letterSpacing: 1.6,
                textTransform: "uppercase",
                color: contrastOn(c3),
                opacity: 0.6,
              }}
            >
              primary action
            </Text>
          </View>
        </View>

        {/* Row 3 — Hero headline + persona */}
        <View style={{ flexDirection: "row", gap: 6, marginBottom: 6, height: 130 }}>
          <View
            style={{
              flex: 2,
              backgroundColor: c1,
              padding: 12,
            }}
          >
            <Text
              style={[
                styles.eyebrow,
                { color: contrastOn(c1), opacity: 0.7, marginBottom: 6 },
              ]}
            >
              hero headline
            </Text>
            <Text
              style={{
                fontFamily: "Times-Roman",
                fontSize: 24,
                lineHeight: 1.05,
                color: contrastOn(c1),
              }}
            >
              {((props.headlines?.[0] || "—").length > 90
                ? (props.headlines?.[0] || "").slice(0, 88) + "…"
                : props.headlines?.[0] || "—")}
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              borderWidth: 0.5,
              borderColor: c1,
              backgroundColor: COLORS.ink,
              padding: 10,
              justifyContent: "space-between",
            }}
          >
            <Text style={[styles.eyebrow, { color: c1 }]}>persona</Text>
            <Text
              style={{
                fontFamily: "Times-Roman",
                fontSize: 16,
                lineHeight: 1.05,
                color: COLORS.bone,
              }}
            >
              {props.persona.name}
            </Text>
            <Text
              style={{
                fontSize: 8,
                color: COLORS.ash,
                lineHeight: 1.4,
              }}
            >
              {(props.persona.traits || []).slice(0, 4).join(" · ")}
            </Text>
          </View>
        </View>

        {/* Row 4 — Mockup */}
        {props.mockupImages.filter(Boolean)[0] && (
          <View
            style={{
              height: 160,
              marginBottom: 6,
              backgroundColor: COLORS.ink,
              borderWidth: 0.5,
              borderColor: COLORS.steel,
              overflow: "hidden",
            }}
          >
            <Image
              src={props.mockupImages.filter(Boolean)[0]!}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </View>
        )}

        <View
          style={{
            position: "absolute",
            bottom: 56,
            left: 56,
            right: 56,
          }}
        >
          <View style={styles.thinDivider} />
          <Text
            style={{
              fontFamily: "Times-Italic",
              fontSize: 20,
              color: COLORS.spark,
              textAlign: "center",
              marginTop: 6,
            }}
          >
            — end of campaign book —
          </Text>
        </View>

        <PageFooter brand={cName} page={14} total={total} />
      </Page>
    </Document>
  );
}

// ============================================================
// Entry helpers
// ============================================================
export const archetypesToLabel = (keys: string[]) =>
  keys
    .map((k) => {
      try {
        return archetypeByKey(k as never).name;
      } catch {
        return k;
      }
    })
    .join(" + ");

export function buildBrandPlaybook(g: GeneratedBrand, languageNative: string) {
  return (
    <BrandPlaybook
      kind="brand"
      name={g.input.businessName}
      industry={g.input.industry}
      description={g.input.description}
      audience={g.input.targetAudience}
      mission={g.input.mission}
      tagline={g.tagline}
      story={g.story}
      patternIdea={g.patternIdea}
      archetypes={archetypesToLabel(g.input.archetypes)}
      tone={g.input.toneKeywords.join(" · ")}
      toneKeywords={g.input.toneKeywords}
      palette={g.selectedPalette}
      type={g.selectedType}
      persona={g.persona}
      mockupImages={g.mockupImages}
      conceptThumbnails={g.palettes.map((p) => p.conceptImageDataUrl)}
      logoImageDataUrl={g.logoImageDataUrl}
      coverImageDataUrl={g.coverImageDataUrl}
      logoDontExamples={g.logoDontExamples ?? []}
      language={languageNative}
    />
  );
}

export function buildCampaignPlaybook(
  g: GeneratedCampaign,
  languageNative: string
) {
  return (
    <CampaignPlaybook
      kind="campaign"
      name={g.input.brandName}
      brandDescription={g.input.brandDescription}
      campaignName={g.input.campaignName}
      campaignPurpose={g.input.campaignPurpose}
      campaignStory={g.input.campaignStory}
      targetMarket={g.input.targetMarket}
      channels={g.input.channels}
      headlines={g.headlines}
      cta={g.cta}
      channelIdeas={g.channelIdeas}
      archetypes={archetypesToLabel(g.input.archetypes)}
      tone={g.input.toneKeywords.join(" · ")}
      toneKeywords={g.input.toneKeywords}
      palette={g.selectedPalette}
      type={g.selectedType}
      persona={g.persona}
      mockupImages={g.mockupImages}
      conceptThumbnails={g.palettes.map((p) => p.conceptImageDataUrl)}
      logoImageDataUrl={g.input.logoDataUrl}
      coverImageDataUrl={g.coverImageDataUrl}
      language={languageNative}
    />
  );
}
