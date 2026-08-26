import Link from "next/link";
import MarkdownEditor from "./MarkdownEditor";
import GoogleDocsEditor from "./GoogleDocsEditor";
import ReverseConverter from "./ReverseConverter";
import type { Tool } from "@/lib/constants";
import { tools } from "@/lib/constants";

export default function ToolPageWrapper({ tool, reverseFormat, gdocsMode }: { tool: Tool; reverseFormat?: "html" | "word" | "pdf"; gdocsMode?: boolean }) {
  const related = tools.filter((t) => t.id !== tool.id).slice(0, 5);
  const faqs = [
    { q: `How to convert ${tool.from} to ${tool.to}?`, a: reverseFormat ? `Upload your file and the tool converts it automatically. Then copy or download.` : `Paste your content, click download. That's it.` },
    { q: "Is my data safe?", a: "All conversions happen in your browser. Files never leave your device." },
    { q: "Is there a file size limit?", a: "Up to 5MB free. Pro users get 50MB + batch conversion." },
  ];

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">Home</Link>
          <span className="text-gray-300">/</span>
          <span className="text-xs text-gray-500 font-medium">{tool.from} to {tool.to}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 mb-2">
          {tool.from} to {tool.to} Converter
        </h1>
        <p className="text-[15px] text-gray-500 max-w-xl">
          Convert {tool.from} to {tool.to} instantly — free, private, no signup.
        </p>
      </div>

      {/* Converter */}
      {gdocsMode ? <GoogleDocsEditor /> : reverseFormat ? <ReverseConverter from={reverseFormat} /> : <MarkdownEditor format={tool.to.toLowerCase()} />}

      {/* How To */}
      <div className="max-w-xl mb-12">
        <h2 className="text-base font-bold text-gray-900 mb-5">How it works</h2>
        <div className="flex gap-6">
          {[
            { n: "1", title: reverseFormat ? "Upload" : "Write", desc: reverseFormat ? `Upload your .${tool.from === "Word" ? "docx" : tool.from.toLowerCase()}` : "Paste or write Markdown" },
            { n: "2", title: "Convert", desc: "One click conversion" },
            { n: "3", title: "Download", desc: `Get your .${tool.to === "Word" ? "docx" : tool.to.toLowerCase()} file` },
          ].map((step) => (
            <div key={step.n} className="flex-1">
              <div className="w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold flex items-center justify-center mb-2">{step.n}</div>
              <div className="text-[13px] font-semibold text-gray-900 mb-0.5">{step.title}</div>
              <div className="text-[12px] text-gray-400">{step.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Related Tools */}
      <div className="mb-12">
        <h2 className="text-base font-bold text-gray-900 mb-4">More Tools</h2>
        <div className="flex flex-wrap gap-2">
          {related.map((t) => (
            <Link key={t.id} href={`/${t.slug}`} className="inline-flex items-center gap-1.5 bg-white border border-gray-100 rounded-lg px-3.5 py-2 text-[13px] font-medium text-gray-500 hover:border-gray-200 hover:text-gray-900 transition-all">
              {t.icon} {t.title}
            </Link>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-xl mb-12">
        <h2 className="text-base font-bold text-gray-900 mb-4">FAQ</h2>
        <div className="space-y-2">
          {faqs.map((faq, i) => (
            <details key={i} className="group border border-gray-100 rounded-xl overflow-hidden bg-white hover:border-gray-200 transition-colors">
              <summary className="px-5 py-3.5 cursor-pointer text-[13px] font-medium text-gray-900 flex items-center justify-between list-none [&::-webkit-details-marker]:hidden">
                {faq.q}
                <svg className="w-3.5 h-3.5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
              </summary>
              <div className="px-5 pb-3.5 text-[13px] text-gray-500 leading-relaxed">{faq.a}</div>
            </details>
          ))}
        </div>
      </div>

      {/* Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify([
        { "@context": "https://schema.org", "@type": "SoftwareApplication", name: `${tool.from} to ${tool.to} Converter`, applicationCategory: "UtilitiesApplication", operatingSystem: "Web", offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } },
        { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((faq) => ({ "@type": "Question", name: faq.q, acceptedAnswer: { "@type": "Answer", text: faq.a } })) },
      ]) }} />
    </div>
  );
}
