import ToolPageWrapper from "@/components/ToolPageWrapper";
import { getToolBySlug } from "@/lib/constants";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Word to Markdown Converter — Free Online",
  description: "Convert Word (.docx) to Markdown online for free. No registration, no watermarks. Fast, secure, and easy to use.",
  alternates: { canonical: "/word-to-markdown" },
};

export default function Page() {
  const tool = getToolBySlug("word-to-markdown");
  if (!tool) return notFound();
  return <ToolPageWrapper tool={tool} reverseFormat="word" />;
}
