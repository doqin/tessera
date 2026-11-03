import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import { AppHeader, Layout } from "@tessera/shared-ui";
import "./globals.css";

const sans = Inter({
  variable: "--font-app-sans",
  subsets: ["latin"],
});

const mono = Roboto_Mono({
  variable: "--font-app-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dashboard — AI Agent UI",
  description: "Tool-Invocation / Dashboard module (remote Module Federation) — UIT.SE.66",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${sans.variable} ${mono.variable} antialiased`}>
        <Layout header={<AppHeader />}>{children}</Layout>
      </body>
    </html>
  );
}
