import Link from "next/link";
import MarkdownEditor from "./MarkdownEditor";
import type { Tool } from "@/lib/constants";
import { tools } from "@/lib/constants";

export default function ToolPage({ tool }: { tool: Tool }) {
  const related = tools.filter((t) => t.id !== tool.id).slice(0, 5);

  const faqs = [
    {
      q: `How to convert ${tool.from} to ${tool.to} for free?`,
      a: `Upload your file or paste content, customize options, and click "Download ${tool.to}". No signup required.`,
    },
    {
      q: "Can I customize the output?",
      a: "Yes! You can adjust formatting options including paper size, fonts, and syntax highlighting.",
    },
    {
      q: "Is there a file size limit?",
      a: "Free users can convert files up to 5MB. Pro users have a 50MB limit with batch conversion support.",
    },
    {
      q: "Is my data safe?",
      a: "All files are processed securely and automatically deleted within 1 hour. We never store or share your content.",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-2">
          {tool.from} to {tool.to} Converter — Free Online
        </h1>
        <p className="text-base text-gray-500">
          Convert your {tool.from} files to {tool.to} instantly.
          No registration, no watermarks.
        </p>
      </div>

      {/* Converter */}
      <MarkdownEditor format={tool.to.toLowerCase()} />

      {/* How To */}
      <div className="max-w-2xl mb-10">
        <h2 className="text-lg font-bold mb-4">
          How to Convert {tool.from} to {tool.to}
        </h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          {[
            { n: "1", title: "Upload or Paste", desc: `Drag & drop or paste ${tool.from} content` },
            { n: "2", title: "Customize", desc: "Set formatting options" },
            { n: "3", title: "Download", desc: `Click convert & download ${tool.to}` },
          ].map((step) => (
            <div key={step.n}>
              <div className="w-9 h-9 rounded-full border-2 border-blue-600 text-blue-600 font-bold text-sm flex items-center justify-center mx-auto mb-2">
                {step.n}
              </div>
              <h3 className="text-sm font-semibold mb-1">{step.title}</h3>
              <p className="text-xs text-gray-400">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Related Tools */}
      <div className="mb-10">
        <h2 className="text-lg font-bold mb-3">Related Tools</h2>
        <div className="flex flex-wrap gap-2">
          {related.map((t) => (
            <Link
              key={t.id}
              href={`/${t.slug}`}
              className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors"
            >
              {t.icon} {t.title}
            </Link>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mb-10">
        <h2 className="text-lg font-bold mb-4">Frequently Asked Questions</h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <details
              key={i}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden group"
            >
              <summary className="px-5 py-4 cursor-pointer font-semibold text-sm text-gray-900 flex items-center justify-between list-none [&::-webkit-details-marker]:hidden">
                {faq.q}
                <span className="text-gray-400 group-open:rotate-45 transition-transform text-lg">
                  +
                </span>
              </summary>
              <div className="px-5 pb-4 text-sm text-gray-500">{faq.a}</div>
            </details>
          ))}
        </div>
      </div>

      {/* Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: `${tool.from} to ${tool.to} Converter`,
              applicationCategory: "UtilitiesApplication",
              operatingSystem: "Web",
              offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            },
            {
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: faqs.map((faq) => ({
                "@type": "Question",
                name: faq.q,
                acceptedAnswer: { "@type": "Answer", text: faq.a },
              })),
            },
          ]),
        }}
      />
    </div>
  );
}
