export function localizeText(value, locale) {
  if (!value && value !== 0 && value !== "") return "";
  if (typeof value === "object" && value !== null) {
    return value[locale] || value.en || "";
  }
  return value || "";
}

export function isBilingual(value) {
  return typeof value === "object" && value !== null && ("en" in value || "az" in value);
}
