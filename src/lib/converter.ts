import { marked } from "marked";
import hljs from "highlight.js";

// Configure marked with highlight.js
marked.setOptions({
  gfm: true,
  breaks: true,
});

const renderer = new marked.Renderer();
renderer.code = function ({ text, lang }: { text: string; lang?: string }) {
  const language = lang && hljs.getLanguage(lang) ? lang : "plaintext";
  const highlighted = hljs.highlight(text, { language }).value;
  return `<pre><code class="hljs language-${language}">${highlighted}</code></pre>`;
};

marked.use({ renderer });

// ============ MD → HTML (inline for preview) ============
export function markdownToHtml(md: string): string {
  return marked.parse(md) as string;
}

// ============ MD → HTML (full page with styles) ============
export function markdownToFullHtml(md: string): string {
  const body = markdownToHtml(md);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Converted Document</title>
<style>
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;
    max-width: 800px; margin: 0 auto; padding: 40px 20px;
    line-height: 1.7; color: #1e293b;
  }
  h1 { font-size: 2em; font-weight: 800; margin: 0.8em 0 0.4em; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.3em; }
  h2 { font-size: 1.5em; font-weight: 700; margin: 0.8em 0 0.4em; }
  h3 { font-size: 1.25em; font-weight: 600; margin: 0.6em 0 0.3em; }
  p { margin: 0.6em 0; }
  a { color: #3b82f6; }
  code { background: #f1f5f9; padding: 0.15em 0.4em; border-radius: 4px; font-size: 0.9em; }
  pre { background: #1e293b; color: #e2e8f0; padding: 16px; border-radius: 8px; overflow-x: auto; }
  pre code { background: none; color: inherit; padding: 0; }
  blockquote { border-left: 4px solid #3b82f6; margin: 1em 0; padding: 0.5em 1em; background: #f8fafc; color: #475569; }
  table { border-collapse: collapse; width: 100%; margin: 1em 0; }
  th, td { border: 1px solid #e2e8f0; padding: 8px 12px; text-align: left; }
  th { background: #f8fafc; font-weight: 600; }
  tr:nth-child(even) { background: #f8fafc; }
  ul, ol { padding-left: 1.5em; margin: 0.6em 0; }
  li { margin: 0.2em 0; }
  hr { border: none; border-top: 2px solid #e2e8f0; margin: 1.5em 0; }
  .hljs-keyword { color: #c084fc; }
  .hljs-string { color: #86efac; }
  .hljs-comment { color: #94a3b8; font-style: italic; }
  .hljs-number { color: #fbbf24; }
  .hljs-title { color: #60a5fa; }
  .hljs-built_in { color: #f472b6; }
  @media print {
    body { padding: 20px; }
    pre { break-inside: avoid; }
  }
</style>
</head>
<body>${body}</body>
</html>`;
}

// ============ MD → PDF (real PDF download) ============
export async function markdownToPdf(md: string): Promise<void> {
  const { generatePdf } = await import("./pdf-generator");
  const html = markdownToFullHtml(md);
  await generatePdf(html, "document.pdf");
}

// ============ MD → Word ============
export async function markdownToWord(md: string): Promise<void> {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = await import("docx");
  const { saveAs } = await import("file-saver");

  const lines = md.split("\n");
  const children: InstanceType<typeof Paragraph>[] = [];

  for (const line of lines) {
    if (line.startsWith("### ")) {
      children.push(new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: line.slice(4), bold: true, size: 24 })] }));
    } else if (line.startsWith("## ")) {
      children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: line.slice(3), bold: true, size: 28 })] }));
    } else if (line.startsWith("# ")) {
      children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: line.slice(2), bold: true, size: 32 })] }));
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      children.push(new Paragraph({ bullet: { level: 0 }, children: parseInline(line.slice(2)) }));
    } else if (/^\d+\.\s/.test(line)) {
      children.push(new Paragraph({ numbering: { reference: "default-numbering", level: 0 }, children: parseInline(line.replace(/^\d+\.\s/, "")) }));
    } else if (line.startsWith("> ")) {
      children.push(new Paragraph({ indent: { left: 720 }, children: [new TextRun({ text: line.slice(2), italics: true, color: "64748b" })] }));
    } else if (line.startsWith("```")) {
      continue;
    } else if (line.trim() === "") {
      children.push(new Paragraph({ children: [] }));
    } else if (line.startsWith("|")) {
      const cells = line.split("|").filter((c) => c.trim()).map((c) => c.trim());
      if (cells.every((c) => /^[-:]+$/.test(c))) continue;
      children.push(new Paragraph({ children: cells.map((c) => new TextRun({ text: c + "  ", size: 20 })) }));
    } else {
      children.push(new Paragraph({ children: parseInline(line) }));
    }
  }

  const doc = new Document({
    numbering: { config: [{ reference: "default-numbering", levels: [{ level: 0, format: "decimal", text: "%1.", alignment: AlignmentType.START }] }] },
    sections: [{ children }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, "document.docx");
}

function parseInline(text: string): InstanceType<typeof import("docx").TextRun>[] {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { TextRun } = require("docx");
  const runs: InstanceType<typeof TextRun>[] = [];
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`[^`]+`)/g);
  for (const part of parts) {
    if (part.startsWith("**") && part.endsWith("**")) {
      runs.push(new TextRun({ text: part.slice(2, -2), bold: true }));
    } else if (part.startsWith("*") && part.endsWith("*")) {
      runs.push(new TextRun({ text: part.slice(1, -1), italics: true }));
    } else if (part.startsWith("`") && part.endsWith("`")) {
      runs.push(new TextRun({ text: part.slice(1, -1), font: "Courier New" }));
    } else if (part) {
      runs.push(new TextRun({ text: part }));
    }
  }
  return runs.length ? runs : [new TextRun({ text })];
}

// ============ HTML → MD ============
export function htmlToMarkdown(html: string): string {
  // Simple turndown-like converter (no external dep needed)
  let md = html;
  // Remove script/style
  md = md.replace(/<script[\s\S]*?<\/script>/gi, "");
  md = md.replace(/<style[\s\S]*?<\/style>/gi, "");
  // Headings
  md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, "# $1\n\n");
  md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, "## $1\n\n");
  md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, "### $1\n\n");
  md = md.replace(/<h4[^>]*>(.*?)<\/h4>/gi, "#### $1\n\n");
  // Bold & italic
  md = md.replace(/<strong[^>]*>(.*?)<\/strong>/gi, "**$1**");
  md = md.replace(/<b[^>]*>(.*?)<\/b>/gi, "**$1**");
  md = md.replace(/<em[^>]*>(.*?)<\/em>/gi, "*$1*");
  md = md.replace(/<i[^>]*>(.*?)<\/i>/gi, "*$1*");
  // Links
  md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, "[$2]($1)");
  // Code
  md = md.replace(/<code[^>]*>(.*?)<\/code>/gi, "`$1`");
  md = md.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, "```\n$1\n```\n\n");
  md = md.replace(/<pre[^>]*>([\s\S]*?)<\/pre>/gi, "```\n$1\n```\n\n");
  // Lists
  md = md.replace(/<li[^>]*>(.*?)<\/li>/gi, "- $1\n");
  md = md.replace(/<\/?[uo]l[^>]*>/gi, "\n");
  // Blockquote
  md = md.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (m, p1) => {
    return p1.split("\n").map((l: string) => `> ${l}`).join("\n") + "\n\n";
  });
  // Paragraphs & breaks
  md = md.replace(/<br\s*\/?>/gi, "\n");
  md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, "$1\n\n");
  // Images
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, "![$2]($1)");
  md = md.replace(/<img[^>]*src="([^"]*)"[^>]*\/?>/gi, "![]($1)");
  // Horizontal rule
  md = md.replace(/<hr\s*\/?>/gi, "---\n\n");
  // Remove remaining tags
  md = md.replace(/<[^>]+>/g, "");
  // Decode entities
  md = md.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  // Clean up whitespace
  md = md.replace(/\n{3,}/g, "\n\n");
  return md.trim();
}

// ============ Word → MD ============
export async function wordToMarkdown(file: File): Promise<string> {
  try {
    const mammoth = await import("mammoth");
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });
    return htmlToMarkdown(result.value);
  } catch {
    throw new Error("Failed to parse Word file. Please ensure it's a valid .docx file.");
  }
}

// ============ PDF → MD (basic text extraction) ============
export async function pdfToMarkdown(file: File): Promise<string> {
  try {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = "";

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ");
      fullText += pageText + "\n\n";
    }

    return fullText
      .split("\n")
      .map((line) => {
        const trimmed = line.trim();
        if (!trimmed) return "";
        if (trimmed === trimmed.toUpperCase() && trimmed.length < 80 && trimmed.length > 3) {
          return `## ${trimmed}`;
        }
        return trimmed;
      })
      .join("\n");
  } catch {
    throw new Error("Failed to parse PDF file. Please ensure it's a valid .pdf file.");
  }
}

// ============ Download helper ============
export function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
