import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "Free Online Markdown Converter — PDF, Word, HTML & More",
    template: "%s | MarkdownConverter",
  },
  description:
    "Convert Markdown to PDF, Word, HTML, LaTeX and more — instantly. No registration, no watermarks, 100% free.",
  metadataBase: new URL("https://markdownconverter.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "MarkdownConverter",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
