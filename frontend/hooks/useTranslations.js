import en from "@/locales/en";
import az from "@/locales/az";
import { useLocale } from "@/context/LanguageContext";

const locales = { en, az };

export function useTranslations() {
  const { locale } = useLocale();
  const dict = locales[locale] || en;
  return (key, params = {}) => {
    let text = dict[key] || key;
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(`{${k}}`, v);
    }
    return text;
  };
}
