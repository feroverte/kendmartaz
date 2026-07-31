import { cookies } from "next/headers";
import en from "@/locales/en";
import az from "@/locales/az";

const dicts = { en, az };

export async function getServerLocale() {
  try {
    const cookieStore = await cookies();
    const locale = cookieStore.get("kendmart_locale")?.value;
    return locale === "az" ? "az" : "en";
  } catch {
    return "en";
  }
}

export function serverT(locale, key, params = {}) {
  const dict = dicts[locale] || en;
  let text = dict[key] || key;
  for (const [k, v] of Object.entries(params)) {
    text = text.replace(`{${k}}`, v);
  }
  return text;
}

export function localizeText(value, locale) {
  if (!value && value !== 0 && value !== "") return "";
  if (typeof value === "object" && value !== null) {
    return value[locale] || value.en || "";
  }
  if (typeof value === "string" && (value.startsWith("{") || value.startsWith('"'))) {
    try {
      const p = JSON.parse(value);
      if (typeof p === "object" && p !== null) return p[locale] || p.en || "";
    } catch {}
  }
  return value || "";
}

export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function formatArticleContent(value, locale) {
  const text = localizeText(value, locale) || "";
  if (!text) return "";
  // If content already contains HTML tags, render as-is
  if (/<\/?[a-z][\s\S]*>/i.test(text)) return text;
  // Convert plain text with tab/newline separators into an HTML table
  if (text.includes("\t") || text.includes("\n")) {
    const rows = text.split("\n").map(r => r.split("\t").map(c => c.trim())).filter(r => r.some(c => c !== ""));
    if (rows.length > 0) {
      const thead = rows[0].map(c => `<th style="padding:8px 16px;border:1px solid #e5e7eb;background:#f3f1eb;text-align:left;font-weight:600;">${escapeHtml(c)}</th>`).join("");
      const body = rows.slice(1).map(r => `<tr>${r.map(c => `<td style="padding:8px 16px;border:1px solid #e5e7eb;">${escapeHtml(c)}</td>`).join("")}</tr>`).join("");
      return `<table style="border-collapse:collapse;width:100%;font-size:14px;margin:16px 0;"><thead><tr>${thead}</tr></thead><tbody>${body}</tbody></table>`;
    }
  }
  return `<p>${escapeHtml(text)}</p>`;
}
