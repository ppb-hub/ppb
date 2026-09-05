import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Portal de Projectos de Benguela",
    short_name: "Benguela GP",
    description: "Projectos, investimentos e transparência pública da Província de Benguela.",
    start_url: "/pt",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0F2B5B",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
