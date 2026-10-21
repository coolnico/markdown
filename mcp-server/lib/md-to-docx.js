/**
 * Markdown → .docx for Node: lean port of src/lib/word-generator.ts without
 * the browser-only parts (KaTeX/html2canvas math images, mermaid). Math is
 * extracted before markdown-it sees it (same emphasis-mangling fix as the web
 * version) and degrades to Unicode text via latexToUnicode().
 */
import MarkdownIt from "markdown-it";
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle, ExternalHyperlink } from "docx";

// ---------- math extraction (before markdown-it, same as the web app) ------

function extractMath(markdown) {
  const lines = markdown.split("\n");
  const out = [];
  let i = 0;
  let inFence = false;
  let fenceChar = "";
  let fenceLen = 0;
  const store = (latex, display) => {
    mathEntries.push({ latex: latex.trim(), display });
    return `%%MATH${mathEntries.length - 1}%%`;
  };
  let mathEntries = [];

  while (i < lines.length) {
    const line = lines[i] ?? "";
    const fenceOpen = inFence ? null : line.match(/^[ \t]{0,3}(`{3,}|~{3,})/);
    if (fenceOpen) {
      inFence = true;
      fenceChar = (fenceOpen[1] ?? "")[0] ?? "`";
      fenceLen = (fenceOpen[1] ?? "").length;
      out.push(line);
      i++;
      continue;
    }
    if (inFence) {
      const close = line.match(/^[ \t]{0,3}(`{3,}|~{3,})\s*$/);
      if (close && (close[1] ?? "")[0] === fenceChar && (close[1] ?? "").length >= fenceLen) inFence = false;
      out.push(line);
      i++;
      continue;
    }
    const open = line.indexOf("$$");
    if (open !== -1 && line.indexOf("$$", open + 2) === -1) {
      let latex = line.slice(open + 2);
      let j = i + 1;
      let closed = false;
      while (j < lines.length) {
        const l = lines[j] ?? "";
        const c = l.indexOf("$$");
        if (c !== -1) {
          latex += `\n${l.slice(0, c)}`;
          closed = true;
          break;
        }
        latex += `\n${l}`;
        j++;
      }
      if (closed) {
        const closeLine = lines[j] ?? "";
        out.push(`${line.slice(0, open)}${store(latex, true)}${closeLine.slice(closeLine.indexOf("$$") + 2)}`);
        i = j + 1;
        continue;
      }
    }
    const segments = line.split(/(`[^`]*`)/g);
    out.push(
      segments
        .map((seg) => {
          if (seg.startsWith("`")) return seg;
          return seg
            .replace(/\$\$([^$]+?)\$\$/g, (_, m) => store(m, true))
            .replace(/(?<![\\$])\$(?!\$)([^$\n]+?)\$(?!\$)/g, (_, m) => store(m, false));
        })
        .join("")
    );
    i++;
  }
  return { md: out.join("\n"), entries: mathEntries };
}

// ---------- LaTeX → Unicode fallback (port of the web version) -------------

const SYMBOLS = {
  "\\alpha": "α", "\\beta": "β", "\\gamma": "γ", "\\delta": "δ", "\\epsilon": "ε",
  "\\zeta": "ζ", "\\eta": "η", "\\theta": "θ", "\\iota": "ι", "\\kappa": "κ",
  "\\lambda": "λ", "\\mu": "μ", "\\nu": "ν", "\\xi": "ξ", "\\pi": "π",
  "\\rho": "ρ", "\\sigma": "σ", "\\tau": "τ", "\\upsilon": "υ", "\\phi": "φ",
  "\\chi": "χ", "\\psi": "ψ", "\\omega": "ω",
  "\\Gamma": "Γ", "\\Delta": "Δ", "\\Theta": "Θ", "\\Lambda": "Λ", "\\Xi": "Ξ",
  "\\Pi": "Π", "\\Sigma": "Σ", "\\Phi": "Φ", "\\Psi": "Ψ", "\\Omega": "Ω",
  "\\infty": "∞", "\\partial": "∂", "\\nabla": "∇", "\\forall": "∀", "\\exists": "∃",
  "\\in": "∈", "\\notin": "∉", "\\subset": "⊂", "\\supset": "⊃", "\\cup": "∪", "\\cap": "∩",
  "\\emptyset": "∅", "\\varnothing": "∅",
  "\\cdot": "·", "\\times": "×", "\\div": "÷", "\\pm": "±", "\\mp": "∓",
  "\\neq": "≠", "\\ne": "≠", "\\leq": "≤", "\\le": "≤", "\\geq": "≥", "\\ge": "≥",
  "\\ll": "≪", "\\gg": "≫", "\\approx": "≈", "\\equiv": "≡", "\\sim": "∼",
  "\\propto": "∝", "\\perp": "⊥", "\\parallel": "∥",
  "\\leftarrow": "←", "\\rightarrow": "→", "\\Leftarrow": "⇐", "\\Rightarrow": "⇒",
  "\\leftrightarrow": "↔", "\\Leftrightarrow": "⇔",
  "\\sum": "∑", "\\prod": "∏", "\\int": "∫", "\\iint": "∬", "\\iiint": "∭", "\\oint": "∮",
  "\\ldots": "…", "\\cdots": "⋯", "\\vdots": "⋮", "\\ddots": "⋱",
  "\\hbar": "ℏ", "\\ell": "ℓ", "\\Re": "ℜ", "\\Im": "ℑ", "\\aleph": "ℵ", "\\wp": "℘",
  "\\neg": "¬", "\\land": "∧", "\\lor": "∨", "\\lnot": "¬",
  "\\triangle": "△", "\\angle": "∠", "\\degree": "°",
  "\\star": "⋆", "\\ast": "∗", "\\circ": "∘", "\\bullet": "∙",
};

function matchBraces(str, start) {
  let depth = 0;
  for (let i = start; i < str.length; i++) {
    if (str[i] === "{") depth++;
    else if (str[i] === "}") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

export function latexToUnicode(latex) {
  let s = latex;
  let idx;
  while ((idx = s.indexOf("\\frac")) !== -1) {
    const after = s.slice(idx + 5);
    const m1 = after.match(/^\s*\{/);
    if (!m1) break;
    const b1 = idx + 5 + m1[0].length - 1;
    const e1 = matchBraces(s, b1);
    if (e1 === -1) break;
    const rest = s.slice(e1 + 1);
    const m2 = rest.match(/^\s*\{/);
    if (!m2) break;
    const b2 = e1 + 1 + m2[0].length - 1;
    const e2 = matchBraces(s, b2);
    if (e2 === -1) break;
    s = s.slice(0, idx) + `(${s.slice(b1 + 1, e1)})/(${s.slice(b2 + 1, e2)})` + s.slice(e2 + 1);
  }
  while ((idx = s.indexOf("\\sqrt")) !== -1) {
    const after = s.slice(idx + 5);
    const m = after.match(/^\s*\{/);
    if (!m) break;
    const b = idx + 5 + m[0].length - 1;
    const e = matchBraces(s, b);
    if (e === -1) break;
    s = s.slice(0, idx) + `√(${s.slice(b + 1, e)})` + s.slice(e + 1);
  }
  for (const [cmd, char] of Object.entries(SYMBOLS).sort((a, b) => b[0].length - a[0].length)) {
    s = s.split(cmd).join(char);
  }
  s = s
    .replace(/\\text\s*\{([^}]*)\}/g, "$1")
    .replace(/\\mathrm\s*\{([^}]*)\}/g, "$1")
    .replace(/\\mathbf\s*\{([^}]*)\}/g, "$1")
    .replace(/\^{([^}]*)}/g, "^($1)")
    .replace(/_{([^}]*)}/g, "_($1)")
    .replace(/\\[,;!]/g, "")
    .replace(/\\left|\\right/g, "")
    .replace(/\{|\}/g, "")
    .replace(/\\\\/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return s;
}

// ---------- docx generation -------------------------------------------------

const COLORS = {
  heading: "2E74B5", body: "1F2937", link: "0563C1",
  quoteText: "475569", quoteBorder: "2E74B5",
  tableHeaderBg: "2E74B5", tableHeaderText: "FFFFFF", tableBorder: "CBD5E1",
  tableRowOdd: "FFFFFF", tableRowEven: "F8FAFC",
  codeText: "334155", codeBackground: "F8FAFC", codeBorder: "E2E8F0", hr: "CBD5E1",
};
const FONT = "Calibri";
const BODY = 24, CODE = 20; // half-points

function inlineRuns(children, docxOpts = {}) {
  const runs = [];
  let bold = docxOpts.bold ? 1 : 0;
  let italics = docxOpts.italics ? 1 : 0;
  let linkHref = "";
  let linkStart = -1;
  const mathEntries = docxOpts.mathEntries || [];
  const base = { font: { name: FONT }, size: docxOpts.size ?? BODY, color: docxOpts.color ?? COLORS.body };

  for (const token of children) {
    switch (token.type) {
      case "strong_open": bold++; break;
      case "strong_close": bold--; break;
      case "em_open": italics++; break;
      case "em_close": italics--; break;
      case "link_open": {
        const href = token.attrGet("href");
        if (href) { linkHref = href; linkStart = runs.length; }
        break;
      }
      case "link_close": {
        if (linkHref) {
          const linked = runs.splice(linkStart).filter((r) => r instanceof TextRun);
          runs.push(new ExternalHyperlink({ link: linkHref, children: linked.length ? linked : [new TextRun({ text: linkHref })] }));
          linkHref = ""; linkStart = -1;
        }
        break;
      }
      case "code_inline":
        runs.push(new TextRun({ ...base, text: token.content, font: { name: "Consolas" }, size: CODE, color: COLORS.codeText, shading: { type: "clear", fill: COLORS.codeBackground }, bold: bold > 0, italics: italics > 0 }));
        break;
      case "text": {
        for (const part of token.content.split(/(%%MATH\d+%%)/g)) {
          if (!part) continue;
          const ph = part.match(/^%%MATH(\d+)%%$/);
          if (ph) {
            const entry = mathEntries[Number(ph[1])];
            runs.push(new TextRun({ ...base, text: entry ? latexToUnicode(entry.latex) : part, italics: true }));
            continue;
          }
          runs.push(new TextRun({ ...base, text: part, bold: bold > 0, italics: italics > 0 }));
        }
        break;
      }
      case "softbreak":
      case "hardbreak":
        runs.push(new TextRun({ ...base, text: "", break: 1 }));
        break;
      case "image": {
        const alt = (token.children || []).map((c) => c.content).join("") || token.attrGet("src") || "";
        runs.push(new TextRun({ ...base, text: `[Image: ${alt}]`, color: COLORS.link, italics: true }));
        break;
      }
      case "html_inline":
        break;
    }
  }
  return runs;
}

function collectTokens(tokens, openType, closeType) {
  const collected = [tokens[0]];
  let depth = 1;
  let i = 1;
  while (i < tokens.length && depth > 0) {
    const t = tokens[i];
    if (t.type === openType) depth++;
    if (t.type === closeType) depth--;
    collected.push(t);
    i++;
  }
  return { collected, next: i };
}

function processList(tokens, ordered, level = 0) {
  const paragraphs = [];
  let i = 0;
  while (i < tokens.length) {
    const token = tokens[i];
    if (token.type !== "list_item_open") { i++; continue; }
    const inlineTokens = [];
    const nested = [];
    let inNested = false;
    let nestedDepth = 0;
    i++;
    while (i < tokens.length) {
      const t = tokens[i];
      if (t.type === "list_item_close") { i++; break; }
      if (t.type === "bullet_list_open" || t.type === "ordered_list_open") { inNested = true; nestedDepth++; nested.push(t); i++; continue; }
      if (t.type === "bullet_list_close" || t.type === "ordered_list_close") { nestedDepth--; nested.push(t); if (nestedDepth === 0) inNested = false; i++; continue; }
      if (inNested) { nested.push(t); i++; continue; }
      if (t.type === "inline") inlineTokens.push(t);
      i++;
    }
    paragraphs.push(new Paragraph({
      children: inlineTokens.flatMap((t) => inlineRuns(t.children)),
      numbering: ordered ? { reference: "md-numbering", level } : undefined,
      bullet: ordered ? undefined : { level },
      indent: { left: (level + 1) * 360, hanging: 260 },
      spacing: { before: 60, after: 60 },
    }));
    if (nested.length > 0) paragraphs.push(...processList(nested, nested[0].type === "ordered_list_open", level + 1));
  }
  return paragraphs;
}

function processTable(tokens) {
  const rows = [];
  let current = null;
  let isHeader = false;
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.type === "thead_open") isHeader = true;
    else if (token.type === "thead_close") isHeader = false;
    else if (token.type === "tr_open") current = [];
    else if (token.type === "tr_close") { rows.push({ cells: current, isHeader }); current = null; }
    else if (token.type === "th_open" || token.type === "td_open") {
      const cell = [];
      i++;
      while (i < tokens.length && tokens[i].type !== "th_close" && tokens[i].type !== "td_close") {
        if (tokens[i].type === "inline") cell.push(tokens[i]);
        i++;
      }
      current.push(cell);
    }
  }
  if (rows.length === 0) return null;
  const border = { style: BorderStyle.SINGLE, size: 1, color: COLORS.tableBorder, space: 0 };
  const tableRows = rows.map(({ cells, isHeader: header }) =>
    new TableRow({
      tableHeader: header,
      children: cells.map((cell) =>
        new TableCell({
          children: [new Paragraph({ children: cell.flatMap((t) => inlineRuns(t.children, { bold: header, color: header ? COLORS.tableHeaderText : COLORS.body })), spacing: { before: 60, after: 60 } })],
          shading: { type: "clear", fill: header ? COLORS.tableHeaderBg : COLORS.tableRowOdd },
          borders: { top: border, bottom: border, left: border, right: border },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
        })
      ),
    })
  );
  return new Table({ rows: tableRows, width: { size: 100, type: WidthType.PERCENTAGE } });
}

export async function markdownToDocx(markdown, outputPath) {
  const { md, entries } = extractMath(markdown);
  const parsed = new MarkdownIt({ html: true, linkify: true }).parse(md, {});
  const paragraphs = [];
  let i = 0;

  while (i < parsed.length) {
    const token = parsed[i];
    switch (token.type) {
      case "heading_open": {
        const inline = parsed[i + 1];
        const level = parseInt(token.tag.replace("h", ""), 10) || 1;
        const levels = [HeadingLevel.HEADING_1, HeadingLevel.HEADING_2, HeadingLevel.HEADING_3, HeadingLevel.HEADING_4, HeadingLevel.HEADING_5, HeadingLevel.HEADING_6];
        paragraphs.push(new Paragraph({
          children: inlineRuns((inline?.children) || [], { bold: true, color: COLORS.heading, size: 40 - (level - 1) * 4 }),
          heading: levels[level - 1] || HeadingLevel.HEADING_1,
          spacing: { before: 320, after: 140 },
        }));
        i += 3;
        continue;
      }
      case "paragraph_open": {
        const inline = parsed[i + 1];
        const solo = inline?.type === "inline" && inline.content.match(/^%%MATH(\d+)%%$/);
        const soloDisplay = !!(solo && entries[Number(solo[1])]?.display);
        paragraphs.push(new Paragraph({
          children: inlineRuns((inline?.children) || [], { mathEntries: entries }),
          alignment: soloDisplay ? AlignmentType.CENTER : undefined,
          spacing: { before: 0, after: 160, line: 300 },
        }));
        i += 3;
        continue;
      }
      case "fence":
      case "code_block": {
        const lines = token.content.split("\n");
        while (lines.length && lines[lines.length - 1].trim() === "") lines.pop();
        const border = { style: BorderStyle.SINGLE, size: 1, color: COLORS.codeBorder, space: 0 };
        lines.forEach((line, l) => {
          paragraphs.push(new Paragraph({
            children: [new TextRun({ text: line.length ? line : " ", font: { name: "Consolas" }, size: CODE, color: COLORS.codeText })],
            shading: { type: "clear", fill: COLORS.codeBackground },
            border: { top: l === 0 ? border : undefined, bottom: l === lines.length - 1 ? border : undefined, left: border, right: border },
            spacing: { before: l === 0 ? 120 : 0, after: l === lines.length - 1 ? 120 : 0, line: 276 },
          }));
        });
        i++;
        continue;
      }
      case "blockquote_open": {
        const { collected, next } = collectTokens(parsed.slice(i), "blockquote_open", "blockquote_close");
        let depth = 0;
        for (const t of collected) {
          if (t.type === "blockquote_open") depth++;
          else if (t.type === "blockquote_close") depth--;
          else if (t.type === "inline" && depth >= 1) {
            paragraphs.push(new Paragraph({
              children: inlineRuns(t.children, { italics: true, color: COLORS.quoteText }),
              indent: { left: 720 },
              border: { left: { style: BorderStyle.SINGLE, size: 12, color: COLORS.quoteBorder, space: 10 } },
              spacing: { before: 100, after: 100 },
            }));
          }
        }
        i += next;
        continue;
      }
      case "bullet_list_open":
      case "ordered_list_open": {
        const { collected, next } = collectTokens(parsed.slice(i), token.type, token.type.replace("_open", "_close"));
        paragraphs.push(...processList(collected, token.type === "ordered_list_open"));
        i += next;
        continue;
      }
      case "table_open": {
        const { collected, next } = collectTokens(parsed.slice(i), "table_open", "table_close");
        const table = processTable(collected);
        if (table) paragraphs.push(table);
        i += next;
        continue;
      }
      case "hr":
        paragraphs.push(new Paragraph({ children: [new TextRun({ text: "─".repeat(50), color: COLORS.hr, font: { name: FONT }, size: BODY })], alignment: AlignmentType.CENTER, spacing: { before: 160, after: 160 } }));
        i++;
        continue;
      default:
        i++;
    }
  }

  const doc = new Document({
    styles: {
      default: {
        document: { run: { font: { name: FONT }, size: BODY, color: COLORS.body }, paragraph: { spacing: { line: 300, after: 160 } } },
      },
    },
    numbering: {
      config: [{
        reference: "md-numbering",
        levels: [
          { level: 0, format: "decimal", text: "%1.", alignment: AlignmentType.START, style: { paragraph: { indent: { left: 360, hanging: 260 } } } },
          { level: 1, format: "lowerLetter", text: "%2.", alignment: AlignmentType.START, style: { paragraph: { indent: { left: 720, hanging: 260 } } } },
          { level: 2, format: "lowerRoman", text: "%3.", alignment: AlignmentType.START, style: { paragraph: { indent: { left: 1080, hanging: 260 } } } },
        ],
      }],
    },
    sections: [{ properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } }, children: paragraphs }],
  });

  const buffer = await Packer.toBuffer(doc);
  return { buffer, filename: "document.docx" };
}
