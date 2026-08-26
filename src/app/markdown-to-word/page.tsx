import ToolPageWrapper from "@/components/ToolPageWrapper";
import { getToolBySlug } from "@/lib/constants";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Markdown to Word Converter — Free Online",
  description:
    "Convert Markdown to Word online for free. No registration, no watermarks. Fast, secure, and easy to use.",
  alternates: { canonical: "/markdown-to-word" },
  openGraph: {
    title: "Markdown to Word Converter — Free Online",
    description: "Convert Markdown to Word instantly. Free, fast, no signup.",
  },
};

export default function Page() {
  const tool = getToolBySlug("markdown-to-word");
  if (!tool) return notFound();
  return <ToolPageWrapper tool={tool} />;
}
