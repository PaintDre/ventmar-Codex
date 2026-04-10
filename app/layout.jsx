import "./globals.css";

export const metadata = {
  title: "Formulario Next.js + Supabase",
  description: "Base de proyecto con formulario listo para conectar a Supabase.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
