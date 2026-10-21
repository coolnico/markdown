# lovemarkdown-mcp

MCP server for [LoveMarkdown](https://lovemarkdown.com) — free online Markdown converter. Lets any MCP client (Claude Desktop, Cursor, Claude Code, …) convert documents locally:

| Tool | What it does |
| --- | --- |
| `markdown_to_docx` | Markdown → styled Word .docx (real heading styles, lists, tables, code blocks, blockquotes) |
| `docx_to_markdown` | Word .docx → clean Markdown. **Native Word equations (OMML) are restored as LaTeX** (`$...$` / `$$...$$`) |
| `markdown_to_latex` | Markdown → complete, compilable LaTeX document (`amsmath`, `listings`, `booktabs`, `hyperref`) |

All conversion runs locally in Node — no uploads, no API keys.

Related web tools (free, browser-based, with rendered LaTeX math and Mermaid diagrams):

- [Markdown to Word](https://lovemarkdown.com/markdown-to-word) — .docx export with KaTeX-rendered formulas and Mermaid diagrams
- [Word to Markdown](https://lovemarkdown.com/word-to-markdown) — .docx → .md with equation restoration
- [Markdown to LaTeX](https://lovemarkdown.com/markdown-to-latex), [Markdown to PDF](https://lovemarkdown.com/markdown-to-pdf), and more at [lovemarkdown.com](https://lovemarkdown.com)

## Install

```bash
npm install -g lovemarkdown-mcp
```

Or run ad hoc with npx — no install needed.

## Configure your MCP client

### Claude Desktop / Claude Code (`claude_desktop_config.json`)

```json
{
  "mcpServers": {
    "lovemarkdown": {
      "command": "npx",
      "args": ["-y", "lovemarkdown-mcp"]
    }
  }
}
```

### Cursor (`~/.cursor/mcp.json`)

```json
{
  "mcpServers": {
    "lovemarkdown": {
      "command": "npx",
      "args": ["-y", "lovemarkdown-mcp"]
    }
  }
}
```

### From source

```bash
git clone https://github.com/coolnico/markdown.git
cd markdown/mcp-server
npm install
node index.js
```

Then point your client at `node index.js` with cwd `mcp-server/`.

## Tool details

### markdown_to_docx

- Arguments: `markdown` (string, required), `output_path` (string, required).
- Real Word heading styles (document outline / TOC work), bullet + ordered + nested lists, bordered tables, fenced code blocks, blockquotes, hyperlinks.
- LaTeX math is flattened to readable Unicode (`\frac{a}{b}` → `(a)/(b)`, `\alpha` → α). Browser-free by design; for formulas rendered as print-quality images use [lovemarkdown.com/markdown-to-word](https://lovemarkdown.com/markdown-to-word).

### docx_to_markdown

- Arguments: `input_path` (string, required), `output_path` (string, optional — also writes the result).
- Native Word equations (OMML) → LaTeX. Supported constructs: fractions, sub/superscripts, radicals, matrices, cases, n-ary operators (sum/integral/product), limits, accents, bars, function application. Unknown constructs degrade to linear text — equations are never silently dropped.
- Tables are preserved as HTML (GitHub renders them); bold/italic/strikethrough, ordered and nested lists convert to standard Markdown.

### markdown_to_latex

- Arguments: `markdown` (string, required), `output_path` (string, optional).
- Output compiles with pdflatex/xelatex out of the box; ready to paste into Overleaf.

## Notes

- Math **images** and Mermaid diagrams need a browser environment; use the web app for those. This server targets document-structure conversion and equation extraction.
- The web converters run entirely client-side; this server runs entirely locally. Nothing is uploaded anywhere.

## License

MIT
