import type { Metadata } from "next";
import type { ReactNode } from "react";
import "../../app/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://ventmar-codex.vercel.app"),
  title: "Ventmar Argentina | Aplicacion a evento privado",
  description:
    "Onboarding de aplicacion para dropshippers que buscan proveedores, stock en Argentina y networking comercial de alto nivel.",
  openGraph: {
    title: "Ventmar Argentina | Evento privado para dropshippers",
    description:
      "Aplicacion de acceso para operadores que quieren vender, escalar y conectar con proveedores y stock en Argentina.",
    url: "https://ventmar-codex.vercel.app",
    siteName: "Ventmar Argentina",
    locale: "es_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ventmar Argentina | Aplicacion a evento privado",
    description:
      "Aplicacion de acceso para dropshippers con foco en proveedores, stock y networking comercial.",
  },
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
