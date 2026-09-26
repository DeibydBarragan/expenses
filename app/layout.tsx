import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "expenses · gastos con calma",
  description: "Registra tus gastos diarios de forma sencilla y minimalista.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
