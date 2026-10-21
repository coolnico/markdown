/** Markdown → compilable LaTeX. Node port of src/lib/latex-generator.ts. */

function processInline(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, "\\textbf{$1}")
    .replace(/__(.+?)__/g, "\\textbf{$1}")
    .replace(/\*(.+?)\*/g, "\\textit{$1}")
    .replace(/_(.+?)_/g, "\\textit{$1}")
    .replace(/`([^`]+)`/g, "\\texttt{$1}")
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "\\includegraphics[width=\\linewidth]{$2}")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "\\href{$2}{$1}");
}

function processTable(lines) {
  const rows = lines
    .filter((line) => !/^\s*\|[-| :]+\|\s*$/.test(line))
    .map((line) =>
      line
        .replace(/^\s*\|/, "")
        .replace(/\|\s*$/, "")
        .split("|")
        .map((cell) => processInline(cell.trim()))
    );
  if (rows.length === 0) return "";
  const colCount = rows[0]?.length || 0;
  const colSpec = Array(colCount).fill("l").join(" | ");
  const header = (rows[0] || []).map((cell) => `\\textbf{${cell}}`).join(" & ");
  const body = rows.slice(1).map((row) => row.join(" & ")).join(" \\\\\n");
  return [
    "\\begin{center}",
    `\\begin{tabular}{| ${colSpec} |}`,
    "\\hline",
    `${header} \\\\`,
    "\\hline",
    body ? `${body} \\\\` : "",
    "\\hline",
    "\\end{tabular}",
    "\\end{center}",
  ].filter(Boolean).join("\n");
}

function processList(items, ordered) {
  const env = ordered ? "enumerate" : "itemize";
  const listItems = items
    .map((item) => {
      const content = item.replace(/^(\s*)([-*+]|\d+\.)\s+/, "");
      return `\\item ${processInline(content)}`;
    })
    .join("\n");
  return `\\begin{${env}}\n${listItems}\n\\end{${env}}`;
}

export function markdownToLatex(markdown) {
  const lines = markdown.split("\n");
  const output = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i] || "";

    const codeMatch = line.match(/^(`{3,}|~{3,})(\w*)/);
    if (codeMatch) {
      const fence = codeMatch[1] || "";
      const lang = codeMatch[2] || "";
      const codeLines = [];
      i++;
      while (i < lines.length && !(lines[i] || "").startsWith(fence)) {
        codeLines.push(lines[i] || "");
        i++;
      }
      const langOpt = lang ? `[language=${lang}]` : "";
      output.push(`\\begin{lstlisting}${langOpt}\n${codeLines.join("\n")}\n\\end{lstlisting}`);
      i++;
      continue;
    }

    if (line.trimStart().startsWith("$$")) {
      const mathLines = [line];
      if (line.slice(line.indexOf("$$") + 2).includes("$$")) {
        i++;
      } else {
        i++;
        while (i < lines.length) {
          mathLines.push(lines[i] || "");
          if ((lines[i] || "").includes("$$")) { i++; break; }
          i++;
        }
      }
      output.push(mathLines.join("\n"));
      continue;
    }

    if (/^\s*\|/.test(line)) {
      const tableLines = [];
      while (i < lines.length && /^\s*\|/.test(lines[i] || "")) {
        tableLines.push(lines[i] || "");
        i++;
      }
      output.push(processTable(tableLines));
      continue;
    }

    if (/^[ \t]*[-*+] /.test(line)) {
      const items = [];
      while (i < lines.length && /^[ \t]*[-*+] /.test(lines[i] || "")) {
        items.push(lines[i] || "");
        i++;
      }
      output.push(processList(items, false));
      continue;
    }

    if (/^[ \t]*\d+\. /.test(line)) {
      const items = [];
      while (i < lines.length && /^[ \t]*\d+\. /.test(lines[i] || "")) {
        items.push(lines[i] || "");
        i++;
      }
      output.push(processList(items, true));
      continue;
    }

    if (/^> /.test(line)) {
      const quoteLines = [];
      while (i < lines.length && /^> /.test(lines[i] || "")) {
        quoteLines.push((lines[i] || "").replace(/^> /, ""));
        i++;
      }
      output.push(`\\begin{quote}\n${quoteLines.map(processInline).join("\n")}\n\\end{quote}`);
      continue;
    }

    if (/^(\*{3,}|-{3,}|_{3,})\s*$/.test(line)) {
      output.push("\\medskip\\noindent\\hrule\\medskip");
      i++;
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = (headingMatch[1] || "").length;
      const content = processInline(headingMatch[2] || "");
      const cmd = ["section", "subsection", "subsubsection", "paragraph", "subparagraph", "subparagraph"][level - 1] || "section";
      output.push(`\\${cmd}{${content}}`);
      i++;
      continue;
    }

    if (line.trim() === "") {
      output.push("");
      i++;
      continue;
    }

    output.push(processInline(line));
    i++;
  }

  const preamble = [
    "\\documentclass{article}",
    "\\usepackage{amsmath}",
    "\\usepackage{amssymb}",
    "\\usepackage{hyperref}",
    "\\usepackage{graphicx}",
    "\\usepackage{listings}",
    "\\usepackage{booktabs}",
    "\\usepackage{xcolor}",
    "\\lstset{",
    "  basicstyle=\\ttfamily\\small,",
    "  breaklines=true,",
    "  frame=single,",
    "  numbers=left,",
    "  numberstyle=\\tiny,",
    "  keywordstyle=\\color{blue},",
    "  commentstyle=\\color{gray},",
    "}",
    "",
    "\\begin{document}",
    "",
  ].join("\n");

  return preamble + output.join("\n") + "\n\n\\end{document}\n";
}
