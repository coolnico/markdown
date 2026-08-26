import ToolPageWrapper from "@/components/ToolPageWrapper";
import { getToolBySlug } from "@/lib/constants";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HTML to Markdown Converter — Free Online",
  description: "Convert HTML to Markdown online for free. No registration, no watermarks. Fast, secure, and easy to use.",
  alternates: { canonical: "/html-to-markdown" },
};

export default function Page() {
  const tool = getToolBySlug("html-to-markdown");
  if (!tool) return notFound();
  return <ToolPageWrapper tool={tool} reverseFormat="html" />;
}
