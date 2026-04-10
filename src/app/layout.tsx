import type { Metadata } from "next";
import type { ReactNode } from "react";
import "../../app/globals.css";

export const metadata: Metadata = {
  title: "Formulario Next.js + Supabase",
  description: "Landing con formulario conectado a Supabase.",
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
