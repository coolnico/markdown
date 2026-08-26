import ToolPageWrapper from "@/components/ToolPageWrapper";
import { getToolBySlug } from "@/lib/constants";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF to Markdown Converter — Free Online",
  description: "Convert PDF to Markdown online for free. No registration, no watermarks. Fast, secure, and easy to use.",
  alternates: { canonical: "/pdf-to-markdown" },
};

export default function Page() {
  const tool = getToolBySlug("pdf-to-markdown");
  if (!tool) return notFound();
  return <ToolPageWrapper tool={tool} reverseFormat="pdf" />;
}
