import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppHeader, Layout } from "@tessera/shared-ui";
import { ZoneNav } from "../components/ZoneNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chat — AI Agent UI",
  description: "Micro Frontend Chat/Prompt module (Next.js Multi-Zones) — UIT.SE.66",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Layout header={<AppHeader />} sidebar={<ZoneNav />}>
          {children}
        </Layout>
      </body>
    </html>
  );
}
