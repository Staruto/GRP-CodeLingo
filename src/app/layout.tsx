import type { Metadata } from "next";
import { Lato } from "next/font/google";
import { Container } from "@/components/container";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "CodeLingo — Practise programming",
    template: "%s | CodeLingo",
  },
  description:
    "Build your understanding of programming concepts with CodeLingo, a practice platform for students.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${lato.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <a
          href="#main-content"
          className="sr-only fixed top-3 left-4 z-50 rounded-md bg-accent px-4 py-2 text-white focus:not-sr-only"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main-content" tabIndex={-1} className="flex min-w-0 flex-1 flex-col">
          <Container className="flex-1 bg-surface py-8 sm:py-10">
            {children}
          </Container>
        </main>
      </body>
    </html>
  );
}
