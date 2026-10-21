#!/usr/bin/env node
/**
 * LoveMarkdown MCP server.
 *
 * Exposes the LoveMarkdown converters (https://lovemarkdown.com) as MCP tools:
 *   - markdown_to_docx   Markdown → styled .docx (headings, lists, tables,
 *                        code blocks, blockquotes; math degrades to Unicode)
 *   - docx_to_markdown   .docx → clean Markdown, with native Word equations
 *                        (OMML) restored as $...$ / $$...$$ LaTeX
 *   - markdown_to_latex  Markdown → compilable LaTeX document
 *
 * Runs over stdio; works in Claude Desktop, Cursor, and any MCP client.
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { writeFile } from "node:fs/promises";
import { markdownToDocx } from "./lib/md-to-docx.js";
import { docxToMarkdown } from "./lib/docx-to-md.js";
import { markdownToLatex } from "./lib/md-to-latex.js";

const TOOLS = [
  {
    name: "markdown_to_docx",
    description:
      "Convert Markdown to a styled Word .docx file. Supports headings (real Word heading styles), bullet/ordered/nested lists, tables, code blocks, blockquotes, links, and horizontal rules. LaTeX math in $...$ / $$...$$ degrades to readable Unicode text (no browser rendering in this environment). Writes the file to disk and reports the output path and size.",
    inputSchema: {
      type: "object",
      properties: {
        markdown: { type: "string", description: "The Markdown source text." },
        output_path: {
          type: "string",
          description: "Absolute or relative path for the .docx file to write.",
        },
      },
      required: ["markdown", "output_path"],
    },
  },
  {
    name: "docx_to_markdown",
    description:
      "Convert a Word .docx file to clean Markdown. Headings, bold/italic, strikethrough, links, ordered/nested lists, code blocks, and blockquotes become Markdown; tables are kept as HTML. Native Word equations (OMML) are restored as LaTeX — inline $...$, display $$...$$. Optionally also writes the .md to disk.",
    inputSchema: {
      type: "object",
      properties: {
        input_path: { type: "string", description: "Path to the .docx file." },
        output_path: {
          type: "string",
          description: "Optional path to also write the Markdown result to.",
        },
      },
      required: ["input_path"],
    },
  },
  {
    name: "markdown_to_latex",
    description:
      "Convert Markdown to a complete, compilable LaTeX document (documentclass article, amsmath, listings, booktabs, hyperref). Headings become sections, code blocks become lstlisting environments, tables become tabular, math passes through for amsmath.",
    inputSchema: {
      type: "object",
      properties: {
        markdown: { type: "string", description: "The Markdown source text." },
        output_path: {
          type: "string",
          description: "Optional path to also write the .tex result to.",
        },
      },
      required: ["markdown"],
    },
  },
];

function textResult(text) {
  return { content: [{ type: "text", text }], isError: false };
}

function errorResult(message) {
  return { content: [{ type: "text", text: message }], isError: true };
}

const server = new Server(
  { name: "lovemarkdown-mcp", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  try {
    switch (name) {
      case "markdown_to_docx": {
        const { buffer } = await markdownToDocx(args.markdown);
        await writeFile(args.output_path, buffer);
        return textResult(
          `Wrote ${(buffer.length / 1024).toFixed(1)} KiB .docx to ${args.output_path}. Math was flattened to Unicode text — for pixel-perfect formulas use https://lovemarkdown.com/markdown-to-word in a browser.`
        );
      }
      case "docx_to_markdown": {
        const { markdown, count } = await docxToMarkdown(args.input_path);
        if (args.output_path) {
          await writeFile(args.output_path, markdown, "utf8");
          return textResult(
            `Converted ${args.input_path} (${count} equation(s) restored as LaTeX). Markdown written to ${args.output_path}:\n\n${markdown}`
          );
        }
        return textResult(
          `Converted ${args.input_path} (${count} equation(s) restored as LaTeX):\n\n${markdown}`
        );
      }
      case "markdown_to_latex": {
        const latex = markdownToLatex(args.markdown);
        if (args.output_path) {
          await writeFile(args.output_path, latex, "utf8");
          return textResult(`LaTeX written to ${args.output_path}:\n\n${latex}`);
        }
        return textResult(latex);
      }
      default:
        return errorResult(`Unknown tool: ${name}`);
    }
  } catch (err) {
    return errorResult(`${name} failed: ${err && err.message ? err.message : err}`);
  }
});

await server.connect(new StdioServerTransport());
