import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { AppHeader, Layout } from "@tessera/shared-ui";
import { Sidebar } from "../components/Sidebar";

const sans = Inter({
  variable: "--font-app-sans",
  subsets: ["latin"],
});

const mono = Roboto_Mono({
  variable: "--font-app-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Agent UI — Shell",
  description: "Application Shell cho AI Agent UI (Micro Frontend PoC) — UIT.SE.66",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${sans.variable} ${mono.variable} antialiased`}>
        <Layout header={<AppHeader />} sidebar={<Sidebar />}>
          {children}
        </Layout>
      </body>
    </html>
  );
}
