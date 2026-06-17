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
  return value || "";
}
