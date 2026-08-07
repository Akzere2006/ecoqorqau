import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EcoQorgau — экологический контроль Каспия",
  description:
    "Единая платформа общественного экологического контроля и оперативного реагирования для Каспийского региона.",
  manifest: "/manifest.webmanifest",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/ecoqorgau-icon.png",
    shortcut: "/ecoqorgau-icon.png",
    apple: "/ecoqorgau-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#073d35",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
