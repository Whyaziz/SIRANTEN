import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SIRATEN - Sistem Informasi Persuratan Ngabeyan",
  description:
    "SIRATEN adalah Sistem Informasi Persuratan Desa Ngabeyan yang memudahkan pembuatan surat keterangan secara cepat, tepat, dan terintegrasi dengan data penduduk. Dirancang untuk mendukung efisiensi administrasi dan pelayanan publik desa.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
