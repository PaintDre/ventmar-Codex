import "./globals.css";

export const metadata = {
  metadataBase: new URL("https://ventmar-codex.vercel.app"),
  title: "Ventmar Argentina | Aplicacion a evento privado",
  description:
    "Onboarding de aplicacion para dropshippers que buscan proveedores, stock en Argentina y networking comercial de alto nivel.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
