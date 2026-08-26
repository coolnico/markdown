import ToolPageWrapper from "@/components/ToolPageWrapper";
import { getToolBySlug } from "@/lib/constants";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Markdown to Google Docs — Free Online",
  description: "Convert Markdown to Google Docs instantly. Copy as rich text and paste directly into Google Docs. Free, no signup.",
  alternates: { canonical: "/markdown-to-google-docs" },
};

export default function Page() {
  const tool = getToolBySlug("markdown-to-google-docs");
  if (!tool) return notFound();
  return <ToolPageWrapper tool={tool} gdocsMode />;
}
