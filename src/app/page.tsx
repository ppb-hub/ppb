import { redirect } from "next/navigation";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";

/** Fallback: o middleware trata "/" (com negociação de idioma); isto cobre o resto. */
export default function RootPage() {
  redirect(`/${DEFAULT_LOCALE}`);
}
