import ToolPageWrapper from "@/components/ToolPageWrapper";
import { getToolBySlug } from "@/lib/constants";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Markdown to HTML Converter — Free Online",
  description:
    "Convert Markdown to HTML online for free. No registration, no watermarks. Fast, secure, and easy to use.",
  alternates: { canonical: "/markdown-to-html" },
  openGraph: {
    title: "Markdown to HTML Converter — Free Online",
    description: "Convert Markdown to HTML instantly. Free, fast, no signup.",
  },
};

export default function Page() {
  const tool = getToolBySlug("markdown-to-html");
  if (!tool) return notFound();
  return <ToolPageWrapper tool={tool} />;
}
