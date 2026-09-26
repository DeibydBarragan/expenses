import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "expenses · gastos con calma",
    short_name: "expenses",
    description: "Registra tus gastos diarios de forma sencilla y minimalista.",
    start_url: "/inicio",
    display: "standalone",
    background_color: "#0d1411",
    theme_color: "#f4f6f3",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
