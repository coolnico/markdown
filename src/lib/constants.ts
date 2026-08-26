export interface Tool {
  id: string;
  slug: string;
  icon: string;
  title: string;
  from: string;
  to: string;
  description: string;
  volume: number;
  difficulty: number;
  cpc: number;
}

export const tools: Tool[] = [
  {
    id: "md-to-pdf",
    slug: "markdown-to-pdf",
    icon: "📄",
    title: "Markdown → PDF",
    from: "Markdown",
    to: "PDF",
    description: "Convert .md files to PDF with custom styles, fonts & page size",
    volume: 9900,
    difficulty: 60,
    cpc: 0.96,
  },
  {
    id: "md-to-word",
    slug: "markdown-to-word",
    icon: "📝",
    title: "Markdown → Word",
    from: "Markdown",
    to: "Word",
    description: "Export Markdown to .docx format for Word & Google Docs",
    volume: 1900,
    difficulty: 52,
    cpc: 0,
  },
  {
    id: "md-to-html",
    slug: "markdown-to-html",
    icon: "🌐",
    title: "Markdown → HTML",
    from: "Markdown",
    to: "HTML",
    description: "Generate clean HTML from Markdown with syntax highlighting",
    volume: 1900,
    difficulty: 50,
    cpc: 6.25,
  },
  {
    id: "md-to-latex",
    slug: "markdown-to-latex",
    icon: "📐",
    title: "Markdown → LaTeX",
    from: "Markdown",
    to: "LaTeX",
    description: "Convert to LaTeX for academic papers & thesis writing",
    volume: 480,
    difficulty: 25,
    cpc: 8.2,
  },
  {
    id: "pdf-to-md",
    slug: "pdf-to-markdown",
    icon: "📑",
    title: "PDF → Markdown",
    from: "PDF",
    to: "Markdown",
    description: "Extract text from PDF and convert to editable Markdown",
    volume: 2400,
    difficulty: 36,
    cpc: 1.77,
  },
  {
    id: "html-to-md",
    slug: "html-to-markdown",
    icon: "🔤",
    title: "HTML → Markdown",
    from: "HTML",
    to: "Markdown",
    description: "Convert HTML pages to clean Markdown format",
    volume: 1600,
    difficulty: 62,
    cpc: 8.51,
  },
  {
    id: "word-to-md",
    slug: "word-to-markdown",
    icon: "📃",
    title: "Word → Markdown",
    from: "Word",
    to: "Markdown",
    description: "Convert .docx documents to Markdown with formatting",
    volume: 590,
    difficulty: 35,
    cpc: 0,
  },
  {
    id: "md-to-gdoc",
    slug: "markdown-to-google-docs",
    icon: "📋",
    title: "Markdown → Google Docs",
    from: "Markdown",
    to: "Google Docs",
    description: "Copy Markdown as rich text to paste into Google Docs",
    volume: 720,
    difficulty: 46,
    cpc: 9.78,
  },
  {
    id: "gdoc-to-md",
    slug: "google-docs-to-markdown",
    icon: "📊",
    title: "Google Docs → Markdown",
    from: "Google Docs",
    to: "Markdown",
    description: "Export Google Docs to Markdown for GitHub & blogs",
    volume: 720,
    difficulty: 46,
    cpc: 10.78,
  },
];

export function getToolBySlug(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}

export const siteConfig = {
  name: "MarkdownConverter",
  url: "https://markdownconverter.com",
  title: "Free Online Markdown Converter — PDF, Word, HTML & More",
  description:
    "Convert Markdown to PDF, Word, HTML, LaTeX and more — instantly. No registration, no watermarks, 100% free.",
};
