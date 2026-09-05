"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { readConsent, CONSENT_EVENT } from "@/lib/consent";

/**
 * Google Analytics só depois de consentimento. Se NEXT_PUBLIC_GA_ID não
 * estiver definido, não é carregado absolutamente nada de terceiros.
 */
export default function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (!gaId) return;
    const check = () => setAllowed(readConsent()?.analytics === true);
    check();
    window.addEventListener(CONSENT_EVENT, check);
    return () => window.removeEventListener(CONSENT_EVENT, check);
  }, [gaId]);

  if (!gaId || !allowed) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}', { anonymize_ip: true });`}
      </Script>
    </>
  );
}
