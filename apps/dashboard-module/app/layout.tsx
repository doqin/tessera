import { Be_Vietnam_Pro, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { AppHeader, Layout, LocaleToggle, ThemeScript, ThemeToggle } from "@tessera/shared-ui";

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

export const metadata = {
  title: "Dashboard — Tessera",
  description: "Tool-Invocation / Dashboard module (remote Module Federation) — UIT.SE.66",
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
        <Layout
          header={
            <AppHeader
              actions={
                <>
                  <LocaleToggle />
                  <ThemeToggle />
                </>
              }
            />
          }
        >
          {children}
        </Layout>
      </body>
    </html>
  );
}
