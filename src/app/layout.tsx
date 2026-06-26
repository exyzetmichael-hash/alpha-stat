import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

// Nunito — округлый, дружелюбный шрифт из дизайн-системы. next/font сам
// размещает его на нашем домене (self-hosted), поэтому строгий CSP с
// font-src 'self' не ломается, и нет запросов к Google у пользователя.
const nunito = Nunito({
  subsets: ["latin", "cyrillic"],
  display: "swap",
  variable: "--font-nunito",
});

export const metadata: Metadata = {
  title: "Сезоны",
  description: "Учёт сезонов программы НКО",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Сезоны",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#E63946",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${nunito.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
