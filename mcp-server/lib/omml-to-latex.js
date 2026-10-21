/**
 * OMML (Office Math Markup Language) → LaTeX, Node port of
 * src/lib/omml-to-latex.ts. Uses jsdom's DOMParser/XMLSerializer/TreeWalker
 * instead of the browser globals. See the TS original for the full construct
 * documentation.
 */
import { unzipSync, zipSync, strFromU8, strToU8 } from "fflate";
import { JSDOM } from "jsdom";

const dom = new JSDOM("<!DOCTYPE html><body></body></html>");
const DOMParser = dom.window.DOMParser;
const XMLSerializer = dom.window.XMLSerializer;
const NodeFilter = dom.window.NodeFilter;

const OMML_NS = "http://schemas.openxmlformats.org/officeDocument/2006/math";
const WORD_NS = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";

const NARY_SYMBOLS = {
  "∑": "\\sum", "∏": "\\prod", "∮": "\\oint", "∬": "\\iint", "∭": "\\iiint",
  "⋃": "\\bigcup", "⋂": "\\bigcap", "⨆": "\\bigsqcup", "⨁": "\\bigoplus", "⨂": "\\bigotimes",
};
const ACCENTS = {
  "◌̂": "\\hat", "◌̃": "\\tilde", "◌̄": "\\bar", "◌́": "\\acute", "◌̀": "\\grave",
  "◌̈": "\\ddot", "◌̊": "\\mathring", "◌̆": "\\breve", "◌̌": "\\check", "◌⃗": "\\vec", "◌̇": "\\dot",
};
const TEXT_SYMBOLS = { "−": "-", "∙": "\\cdot" };

function firstChild(el, local) {
  for (let i = 0; i < el.children.length; i++) {
    if (el.children[i].localName === local) return el.children[i];
  }
  return null;
}

function allChildren(el, local) {
  return Array.from(el.children).filter((c) => c.localName === local);
}

function attrVal(el) {
  return el ? el.getAttribute("m:val") || el.getAttribute("val") || "" : "";
}

function prChild(el, prLocal, childLocal) {
  const pr = firstChild(el, prLocal);
  return pr ? firstChild(pr, childLocal) : null;
}

function runText(el) {
  let out = "";
  const walk = (node) => {
    for (const c of Array.from(node.children)) {
      if (c.namespaceURI === OMML_NS && c.localName === "t") {
        let t = c.textContent ?? "";
        for (const [ch, cmd] of Object.entries(TEXT_SYMBOLS)) t = t.split(ch).join(cmd);
        out += t;
      } else {
        walk(c);
      }
    }
  };
  walk(el);
  return out;
}

function escapeMathText(t) {
  return t.replace(/[{}%$&#_]/g, (ch) => `\\${ch}`);
}

function latexFor(el) {
  switch (el.localName) {
    case "r": {
      let t = runText(el);
      const sty = prChild(el, "rPr", "sty");
      if (attrVal(sty) === "p") {
        t = escapeMathText(t);
        return t ? `\\text{${t}}` : "";
      }
      return escapeMathText(t);
    }
    case "f": {
      const num = firstChild(el, "num");
      const den = firstChild(el, "den");
      const type = attrVal(prChild(el, "fPr", "type"));
      const n = num ? latexFor(num) : "";
      const d = den ? latexFor(den) : "";
      if (type === "lin") return `${n}/${d}`;
      return `\\frac{${n}}{${d}}`;
    }
    case "sSup": {
      const e = firstChild(el, "e");
      const sup = firstChild(el, "sup");
      return `{${e ? latexFor(e) : ""}}^{${sup ? latexFor(sup) : ""}}`;
    }
    case "sSub": {
      const e = firstChild(el, "e");
      const sub = firstChild(el, "sub");
      return `{${e ? latexFor(e) : ""}}_{${sub ? latexFor(sub) : ""}}`;
    }
    case "sSubSup": {
      const e = firstChild(el, "e");
      const sub = firstChild(el, "sub");
      const sup = firstChild(el, "sup");
      return `{${e ? latexFor(e) : ""}}_{${sub ? latexFor(sub) : ""}}^{${sup ? latexFor(sup) : ""}}`;
    }
    case "d": {
      const beg = attrVal(prChild(el, "dPr", "begChr")) || "(";
      const end = attrVal(prChild(el, "dPr", "endChr")) || ")";
      const es = allChildren(el, "e");
      const parts = es.map((e) => latexFor(e));
      if ((beg === "{" || beg === "\\{") && es.length > 1) {
        return `\\begin{cases}${parts.join(" \\\\ ")}\\end{cases}`;
      }
      const body = parts.join(" \\\\ ");
      const leftDelim = beg === "{" || beg === "\\{" ? "\\{" : beg;
      const rightDelim = end === "{" || end === "\\{" ? "\\}" : end;
      return `\\left${leftDelim}${body}\\right${rightDelim}`;
    }
    case "nary": {
      const chr = attrVal(prChild(el, "naryPr", "chr"));
      const op = NARY_SYMBOLS[chr] || "\\int";
      const subHide = attrVal(prChild(el, "naryPr", "subHide")) === "1";
      const supHide = attrVal(prChild(el, "naryPr", "supHide")) === "1";
      const sub = firstChild(el, "sub");
      const sup = firstChild(el, "sup");
      const e = firstChild(el, "e");
      let out = op;
      if (!subHide && sub) out += `_{${latexFor(sub)}}`;
      if (!supHide && sup) out += `^{${latexFor(sup)}}`;
      return `${out} ${e ? latexFor(e) : ""}`;
    }
    case "rad": {
      const degHide = attrVal(prChild(el, "radPr", "degHide")) === "1";
      const deg = firstChild(el, "deg");
      const e = firstChild(el, "e");
      const body = e ? latexFor(e) : "";
      return degHide || !deg ? `\\sqrt{${body}}` : `\\sqrt[${latexFor(deg)}]{${body}}`;
    }
    case "m": {
      const rows = allChildren(el, "mr").map((row) =>
        allChildren(row, "e").map((cell) => latexFor(cell)).join(" & ")
      );
      return `\\begin{matrix}${rows.join(" \\\\ ")}\\end{matrix}`;
    }
    case "eqArr": {
      const rows = allChildren(el, "e").map((e) => latexFor(e));
      return `\\begin{aligned}${rows.join(" \\\\ ")}\\end{aligned}`;
    }
    case "func": {
      const fName = firstChild(el, "fName");
      const e = firstChild(el, "e");
      return `${fName ? latexFor(fName) : ""}(${e ? latexFor(e) : ""})`;
    }
    case "limLow": {
      const e = firstChild(el, "e");
      const lim = firstChild(el, "lim");
      return `${e ? latexFor(e) : ""}_{${lim ? latexFor(lim) : ""}}`;
    }
    case "limUpp": {
      const e = firstChild(el, "e");
      const lim = firstChild(el, "lim");
      return `${e ? latexFor(e) : ""}^{${lim ? latexFor(lim) : ""}}`;
    }
    case "acc": {
      const chr = attrVal(prChild(el, "accPr", "chr"));
      const cmd = ACCENTS[chr] || "\\hat";
      const e = firstChild(el, "e");
      return `${cmd}{${e ? latexFor(e) : ""}}`;
    }
    case "bar": {
      const pos = attrVal(prChild(el, "barPr", "pos"));
      const e = firstChild(el, "e");
      return `${pos === "bot" ? "\\underline" : "\\overline"}{${e ? latexFor(e) : ""}}`;
    }
    case "sPre": {
      const e = firstChild(el, "e");
      const sub = firstChild(el, "sub");
      const sup = firstChild(el, "sup");
      return `{${e ? latexFor(e) : ""}}_{${sub ? latexFor(sub) : ""}}^{${sup ? latexFor(sup) : ""}}`;
    }
    case "phant": {
      const e = firstChild(el, "e");
      return `\\phantom{${e ? latexFor(e) : ""}}`;
    }
    case "e":
    case "num":
    case "den":
    case "sub":
    case "sup":
    case "deg":
    case "lim":
    case "mr":
    case "oMath":
    case "oMathPara":
    case "box":
    case "borderBox":
    case "groupChr": {
      let out = "";
      for (const c of Array.from(el.children)) out += latexFor(c);
      return out;
    }
    default: {
      const text = runText(el);
      if (text) return escapeMathText(text);
      let out = "";
      for (const c of Array.from(el.children)) out += latexFor(c);
      return out;
    }
  }
}

/**
 * Replace every math node in word/document.xml with %%OMML<n>%% placeholder
 * runs and rebuild the .docx. Returns { buffer, formulas } or null.
 */
export function rewriteDocxMath(docxBytes) {
  let entries;
  try {
    entries = unzipSync(new Uint8Array(docxBytes));
  } catch {
    return null;
  }
  const docEntry = entries["word/document.xml"];
  if (!docEntry) return null;

  const xmlText = strFromU8(docEntry);
  if (!xmlText.includes("oMath")) return null;

  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, "text/xml");
  if (doc.getElementsByTagName("parsererror").length > 0) return null;

  const formulas = [];
  const mathNodes = [];
  const walker = doc.createTreeWalker(doc.documentElement, NodeFilter.SHOW_ELEMENT);
  let current = walker.currentNode;
  while (current) {
    const el = current;
    if (el.namespaceURI === OMML_NS && el.localName === "oMathPara") {
      mathNodes.push(el);
    } else if (el.namespaceURI === OMML_NS && el.localName === "oMath") {
      let ancestor = el.parentElement;
      let insidePara = false;
      while (ancestor) {
        if (ancestor.namespaceURI === OMML_NS && ancestor.localName === "oMathPara") {
          insidePara = true;
          break;
        }
        ancestor = ancestor.parentElement;
      }
      if (!insidePara) mathNodes.push(el);
    }
    current = walker.nextNode();
  }

  for (const node of mathNodes) {
    const display = node.localName === "oMathPara";
    const index = formulas.length;
    formulas.push({ latex: latexFor(node).trim(), display });
    const run = doc.createElementNS(WORD_NS, "w:r");
    const t = doc.createElementNS(WORD_NS, "w:t");
    t.setAttribute("xml:space", "preserve");
    t.textContent = `%%OMML${index}%%`;
    run.appendChild(t);
    node.parentNode.replaceChild(run, node);
  }

  if (formulas.length === 0) return null;

  entries["word/document.xml"] = strToU8(new XMLSerializer().serializeToString(doc));
  const zipped = zipSync(entries);
  const buffer = zipped.buffer.slice(zipped.byteOffset, zipped.byteOffset + zipped.byteLength);
  return { buffer, formulas };
}
