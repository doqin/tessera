import type { Metadata } from "next";
import { Be_Vietnam_Pro, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { Layout, ThemeScript } from "@tessera/shared-ui";
import { ShellHeader } from "../components/ShellHeader";
import { Sidebar } from "../components/Sidebar";
import { StatusBar } from "../components/StatusBar";

// Lab-notebook type system: serif display voice, Plex for UI, Plex Mono for data.
// All three carry Vietnamese subsets — the product ships VI first.
// One modern grotesk for the product, one neutral mono for machine data.
// Be Vietnam Pro is drawn for Vietnamese, which ships first here.
const sans = Be_Vietnam_Pro({
  variable: "--font-app-sans",
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const mono = Roboto_Mono({
  variable: "--font-app-mono",
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Tessera — AI Agent Console",
  description: "Application Shell cho AI Agent UI (remote Module Federation) — UIT.SE.66",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning className={`${sans.variable} ${mono.variable}`}>
      <head>
        <ThemeScript />
      </head>
      <body className="antialiased">
        <Layout header={<ShellHeader />} sidebar={<Sidebar />} statusBar={<StatusBar />}>
          {children}
        </Layout>
      </body>
    </html>
  );
}
