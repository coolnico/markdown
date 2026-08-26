"use client";

import { useState } from "react";
import { markdownToHtml } from "@/lib/converter";

const defaultMarkdown = `# Hello World

This is a **Markdown** document with:

- Bullet points
- \`Inline code\`
- [Links](https://example.com)

> "Paste this directly into Google Docs!"

## Table Example

| Feature | Supported |
|---------|-----------|
| Headings | ✅ |
| Bold/Italic | ✅ |
| Tables | ✅ |
`;

export default function GoogleDocsEditor() {
  const [markdown, setMarkdown] = useState(defaultMarkdown);
  const [copied, setCopied] = useState(false);

  const handleCopyRichText = async () => {
    const html = markdownToHtml(markdown);
    // Wrap in a styled container for better Google Docs rendering
    const styledHtml = `<div style="font-family: Arial, sans-serif; line-height: 1.6;">${html}</div>`;

    try {
      const blob = new Blob([styledHtml], { type: "text/html" });
      const plainBlob = new Blob([markdown], { type: "text/plain" });
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": blob,
          "text/plain": plainBlob,
        }),
      ]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: copy plain text
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-10">
      <div className="flex flex-col md:flex-row min-h-[420px]">
        {/* Left: Editor */}
        <div className="flex-1 flex flex-col border-b md:border-b-0 md:border-r border-gray-100">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Markdown</span>
            <div className="flex gap-1.5">
              <label className="text-[11px] px-2.5 py-1 rounded-md border border-gray-200 text-gray-500 cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-all font-medium">
                Upload
                <input type="file" accept=".md,.txt,.markdown" className="hidden" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) { const r = new FileReader(); r.onload = (ev) => setMarkdown(ev.target?.result as string); r.readAsText(file); }
                }} />
              </label>
              <button className="text-[11px] px-2.5 py-1 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300 transition-all font-medium" onClick={() => navigator.clipboard.readText().then(setMarkdown)}>
                Paste
              </button>
            </div>
          </div>
          <div className="flex-1 p-5">
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              className="w-full h-full min-h-[320px] border-none outline-none resize-none font-mono text-[13px] leading-[1.8] text-gray-800 placeholder:text-gray-300"
              placeholder="Paste your Markdown here..."
            />
          </div>
        </div>

        {/* Right: Preview + Copy */}
        <div className="flex-1 flex flex-col bg-gray-50/50">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Preview</span>
            <button
              onClick={handleCopyRichText}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm ${
                copied
                  ? "bg-green-500 text-white shadow-green-200"
                  : "bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700"
              }`}
            >
              {copied ? "✅ Copied!" : "📋 Copy to Google Docs"}
            </button>
          </div>
          <div className="flex-1 p-5 overflow-auto">
            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: markdownToHtml(markdown) }} />
          </div>
          <div className="px-5 py-3 border-t border-gray-100 bg-indigo-50/50">
            <p className="text-[11px] text-indigo-600 font-medium">
              💡 Click &quot;Copy to Google Docs&quot; → Open Google Docs → Ctrl/Cmd+V to paste. Formatting is preserved!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
