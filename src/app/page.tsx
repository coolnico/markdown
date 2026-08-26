import { tools } from "@/lib/constants";
import ToolCard from "@/components/ToolCard";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Online Markdown Converter — PDF, Word, HTML & More",
  description: "Convert Markdown to PDF, Word, HTML, LaTeX and more — instantly. No registration, no watermarks, 100% free.",
  alternates: { canonical: "/" },
};

const faqs = [
  { q: "How to convert Markdown to PDF?", a: "Click \"Markdown → PDF\", paste your Markdown or upload a .md file, then click \"Download PDF\". It's that simple." },
  { q: "Is this tool free?", a: "Yes! All conversions are free with no registration. Pro ($5/mo) adds batch conversion & API access." },
  { q: "Is my data safe?", a: "All conversions happen in your browser. Your files never leave your device — 100% private." },
  { q: "What formats do you support?", a: "PDF, Word (.docx), HTML, LaTeX, and more coming soon." },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/80 via-white to-white" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-indigo-100/40 to-transparent rounded-full blur-3xl" />
        <div className="relative max-w-3xl mx-auto text-center pt-16 pb-12 px-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            Free & Open Source
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight text-gray-900 leading-tight mb-4">
            The <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Markdown Converter</span>
            <br />You&apos;ll Actually Enjoy Using
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto leading-relaxed mb-8">
            Convert Markdown to PDF, Word, HTML, LaTeX & more — instantly.
            <br />No signup. No watermarks. No nonsense.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link href="/markdown-to-pdf" className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/20 hover:shadow-gray-900/30">
              Start Converting →
            </Link>
            <a href="#tools" className="inline-flex items-center gap-2 bg-white text-gray-700 px-6 py-3 rounded-xl text-sm font-semibold border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all">
              View All Tools
            </a>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section id="tools" className="max-w-6xl mx-auto px-6 pb-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-2">All Conversion Tools</h2>
          <p className="text-sm text-gray-500">Choose a converter to get started</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>

      {/* Trust */}
      <section className="max-w-3xl mx-auto px-6 py-12 text-center">
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-gray-400 font-medium">
          <span className="flex items-center gap-1.5"><svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>100% Free</span>
          <span className="flex items-center gap-1.5"><svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>Privacy First</span>
          <span className="flex items-center gap-1.5"><svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>Instant</span>
          <span className="flex items-center gap-1.5"><svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>No Registration</span>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-2xl mx-auto px-6 pb-12">
        <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Frequently Asked Questions</h2>
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <details key={i} className="group border border-gray-100 rounded-xl overflow-hidden bg-white hover:border-gray-200 transition-colors">
              <summary className="px-5 py-4 cursor-pointer text-sm font-medium text-gray-900 flex items-center justify-between list-none [&::-webkit-details-marker]:hidden">
                {faq.q}
                <svg className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
              </summary>
              <div className="px-5 pb-4 text-sm text-gray-500 leading-relaxed">{faq.a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* SEO Content */}
      <section className="max-w-2xl mx-auto px-6 pb-20">
        <div className="prose prose-sm">
          <h2>Free Online Markdown Converter</h2>
          <p>MarkdownConverter is a free online tool that converts Markdown files to PDF, Word, HTML, LaTeX and other formats. Whether you&apos;re a developer writing documentation, a student working on academic papers, or a content creator publishing blog posts, our converter handles all your Markdown conversion needs.</p>
          <p>Unlike other tools, MarkdownConverter runs entirely in your browser — your files never leave your device. No registration required, no watermarks added.</p>
        </div>
      </section>

      {/* FAQ Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqs.map((faq) => ({ "@type": "Question", name: faq.q, acceptedAnswer: { "@type": "Answer", text: faq.a } })),
      }) }} />
    </>
  );
}
