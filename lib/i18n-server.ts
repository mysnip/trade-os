import { cookies } from "next/headers";

import { getDictionary, localeCookieName, normalizeLocale } from "@/lib/i18n";

export function getCurrentLocale() {
  return normalizeLocale(cookies().get(localeCookieName)?.value);
}

export function getCurrentDictionary() {
  return getDictionary(getCurrentLocale());
}
