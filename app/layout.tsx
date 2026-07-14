import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SIGMANT — Sistema de Gestión de Mantenimiento | TRANSNUPERSA S.A.",
  description:
    "Portal web responsive para la gestión del mantenimiento vehicular de flotas de transporte de carga pesada — TRANSNUPERSA S.A.",
  keywords: [
    "mantenimiento vehicular",
    "gestión de flota",
    "SIGMANT",
    "TRANSNUPERSA",
    "vehículos pesados",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@600;700;800;900&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="h-full">{children}</body>
    </html>
  );
}
