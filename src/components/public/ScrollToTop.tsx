"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Em navegações para OUTRA página, o scroll começa no topo.
 * (Alterar query params na mesma página não força scroll — mantém UX de filtros.)
 */
export default function ScrollToTop() {
  const pathname = usePathname();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return null;
}
