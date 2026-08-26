"use client";

import { useState } from "react";
import { markdownToHtml, markdownToFullHtml, markdownToPdf, markdownToWord, downloadFile } from "@/lib/converter";

const defaultMarkdown = `# Hello World

This is a **Markdown** document with:

- Bullet points
- \`Inline code\`
- [Links](https://example.com)

\`\`\`python
def hello():
    print("Hello, Markdown!")
\`\`\`

> "Markdown allows you to write using an easy-to-read, easy-to-write plain text format."

## Table Example

| Feature | Supported |
|---------|-----------|
| Headings | ✅ |
| Bold/Italic | ✅ |
| Code Blocks | ✅ |
| Tables | ✅ |
`;

export default function MarkdownEditor({ format }: { format: string }) {
  const [markdown, setMarkdown] = useState(defaultMarkdown);
  const [converting, setConverting] = useState(false);

  const handleConvert = async () => {
    setConverting(true);
    try {
      if (format === "html") downloadFile(markdownToFullHtml(markdown), "document.html", "text/html");
      else if (format === "pdf") await markdownToPdf(markdown);
      else if (format === "word" || format === "docx") await markdownToWord(markdown);
      else if (format === "latex") downloadFile(markdownToLatex(markdown), "document.tex", "application/x-tex");
    } catch (err) {
      console.error(err);
      alert("Conversion failed. Please try again.");
    } finally {
      setConverting(false);
    }
  };

  const labels: Record<string, string> = { pdf: "Download PDF", word: "Download Word", docx: "Download DOCX", html: "Download HTML", latex: "Download LaTeX" };
  const icons: Record<string, string> = { pdf: "📄", word: "📝", docx: "📝", html: "🌐", latex: "📐" };

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

        {/* Right: Preview */}
        <div className="flex-1 flex flex-col bg-gray-50/50">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Preview</span>
            <button
              onClick={handleConvert}
              disabled={converting}
              className="inline-flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {converting ? (
                <><svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Converting...</>
              ) : (
                <>{icons[format]} {labels[format] || `Download ${format.toUpperCase()}`}</>
              )}
            </button>
          </div>
          <div className="flex-1 p-5 overflow-auto">
            <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: markdownToHtml(markdown) }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function markdownToLatex(md: string): string {
  let latex = "\\documentclass{article}\n\\usepackage[utf8]{inputenc}\n\\usepackage{hyperref}\n\\usepackage{listings}\n\\usepackage{graphicx}\n\n\\begin{document}\n\n";
  const lines = md.split("\n");
  let inCode = false;
  for (const line of lines) {
    if (line.startsWith("```")) {
      if (inCode) { latex += "\\end{lstlisting}\n\n"; inCode = false; }
      else { latex += `\\begin{lstlisting}[language=${line.slice(3).trim() || "text"}]\n`; inCode = true; }
      continue;
    }
    if (inCode) { latex += line + "\n"; continue; }
    if (line.startsWith("# ")) latex += `\\section{${line.slice(2)}}\n\n`;
    else if (line.startsWith("## ")) latex += `\\subsection{${line.slice(3)}}\n\n`;
    else if (line.startsWith("### ")) latex += `\\subsubsection{${line.slice(4)}}\n\n`;
    else if (line.startsWith("> ")) latex += `\\begin{quote}${line.slice(2)}\\end{quote}\n\n`;
    else if (line.startsWith("- ")) latex += `\\begin{itemize}\n\\item ${line.slice(2)}\n\\end{itemize}\n\n`;
    else if (line.trim() === "") latex += "\n";
    else latex += line.replace(/\*\*(.+?)\*\*/g, "\\textbf{$1}").replace(/\*(.+?)\*/g, "\\textit{$1}").replace(/`(.+?)`/g, "\\texttt{$1}") + "\n\n";
  }
  return latex + "\\end{document}";
}
