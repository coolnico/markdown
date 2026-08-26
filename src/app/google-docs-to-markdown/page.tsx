import ToolPageWrapper from "@/components/ToolPageWrapper";
import { getToolBySlug } from "@/lib/constants";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Google Docs to Markdown — Free Online",
  description: "Convert Google Docs to Markdown instantly. Paste content from Google Docs and get clean Markdown. Free, no signup.",
  alternates: { canonical: "/google-docs-to-markdown" },
};

export default function Page() {
  const tool = getToolBySlug("google-docs-to-markdown");
  if (!tool) return notFound();
  return <ToolPageWrapper tool={tool} reverseFormat="html" />;
}
