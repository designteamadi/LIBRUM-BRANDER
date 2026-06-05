import type { LanguageCode } from "./types";

export const LANGUAGES: { code: LanguageCode; name: string; native: string }[] = [
  { code: "en", name: "English", native: "English" },
  { code: "id", name: "Indonesian", native: "Bahasa Indonesia" },
  { code: "ms", name: "Malay", native: "Bahasa Melayu" },
  { code: "th", name: "Thai", native: "ไทย" },
  { code: "vi", name: "Vietnamese", native: "Tiếng Việt" },
  { code: "tl", name: "Tagalog", native: "Tagalog" },
  { code: "es", name: "Spanish", native: "Español" },
  { code: "fr", name: "French", native: "Français" },
  { code: "de", name: "German", native: "Deutsch" },
  { code: "ja", name: "Japanese", native: "日本語" },
  { code: "ko", name: "Korean", native: "한국어" },
  { code: "zh", name: "Chinese", native: "中文" },
];

export const languageName = (c: LanguageCode) =>
  LANGUAGES.find((l) => l.code === c)?.name ?? "English";

export const languageNative = (c: LanguageCode) =>
  LANGUAGES.find((l) => l.code === c)?.native ?? "English";
