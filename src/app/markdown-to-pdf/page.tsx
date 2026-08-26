import ToolPageWrapper from "@/components/ToolPageWrapper";
import { getToolBySlug } from "@/lib/constants";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Markdown to PDF Converter — Free Online",
  description:
    "Convert Markdown to PDF online for free. No registration, no watermarks. Fast, secure, and easy to use.",
  alternates: { canonical: "/markdown-to-pdf" },
  openGraph: {
    title: "Markdown to PDF Converter — Free Online",
    description: "Convert Markdown to PDF instantly. Free, fast, no signup.",
  },
};

export default function Page() {
  const tool = getToolBySlug("markdown-to-pdf");
  if (!tool) return notFound();
  return <ToolPageWrapper tool={tool} />;
}
