import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Sistema de Historia Clínica | LlajtaMed",
  description: "Plataforma de gestión de historias clínicas para estudiantes y docentes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} ${outfit.variable}`}>
      <body className="font-sans antialiased min-h-screen bg-slate-50 text-slate-900">
        <main>{children}</main>
      </body>
    </html>
  );
}
