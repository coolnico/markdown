/** .docx → Markdown: mammoth + turndown + OMML→LaTeX restoration.
 *  Mirrors wordToMarkdown() in src/lib/converter.ts. */
import { readFile } from "node:fs/promises";
import mammoth from "mammoth";
import TurndownService from "turndown";
import { rewriteDocxMath } from "./omml-to-latex.js";

export async function docxToMarkdown(inputPath) {
  const bytes = await readFile(inputPath);
  const arrayBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);

  const rewrite = rewriteDocxMath(arrayBuffer);
  // Node mammoth takes a Node Buffer (the browser build takes arrayBuffer).
  const docxBuffer = Buffer.from(rewrite ? rewrite.buffer : arrayBuffer);
  // docx-js writes style values without spaces ("Heading1"); MS Word writes
  // "Heading 1". Map both so our own exports round-trip.
  const result = await mammoth.convertToHtml({
    buffer: docxBuffer,
    styleMap: [1, 2, 3, 4, 5, 6].map((n) => `p[style-name='Heading${n}'] => h${n}:fresh`),
  });

  const td = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    bulletListMarker: "-",
    emDelimiter: "*",
  });
  td.addRule("strikethrough", {
    filter: ["s", "del", "strike"],
    replacement: (content) => `~~${content}~~`,
  });
  td.keep(["table", "thead", "tbody", "tr", "th", "td"]);

  let md = td.turndown(result.value).trim() + "\n";

  let count = 0;
  if (rewrite) {
    count = rewrite.formulas.length;
    md = md.replace(/%%OMML(\d+)%%/g, (_, i) => {
      const formula = rewrite.formulas[Number(i)];
      if (!formula) return "";
      return formula.display ? `$$\n${formula.latex}\n$$` : `$${formula.latex}$`;
    });
  }
  return { markdown: md, count };
}
