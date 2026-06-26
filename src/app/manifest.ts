import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Сезоны — учёт сезонов программы",
    short_name: "Сезоны",
    description: "Внутренний сервис учёта сезонов программы НКО",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f0eb",
    theme_color: "#E63946",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
