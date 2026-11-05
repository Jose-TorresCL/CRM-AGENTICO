import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CRM Operativo",
  description: "Gestión operativa para revestimiento de piscinas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
