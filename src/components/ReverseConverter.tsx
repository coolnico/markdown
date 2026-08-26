"use client";

import { useState, useRef } from "react";
import { htmlToMarkdown, wordToMarkdown, pdfToMarkdown, downloadFile } from "@/lib/converter";

type SourceFormat = "html" | "word" | "pdf";

export default function ReverseConverter({ from }: { from: SourceFormat }) {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [converting, setConverting] = useState(false);
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const acceptMap: Record<SourceFormat, string> = { html: ".html,.htm", word: ".docx", pdf: ".pdf" };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setConverting(true);
    try {
      let md = "";
      if (from === "html") md = htmlToMarkdown(await file.text());
      else if (from === "word") md = await wordToMarkdown(file);
      else if (from === "pdf") md = await pdfToMarkdown(file);
      setOutput(md);
    } catch (err) { console.error(err); alert("Conversion failed."); }
    finally { setConverting(false); }
  };

  const handleTextConvert = () => {
    if (!input.trim()) return;
    setConverting(true);
    try { if (from === "html") setOutput(htmlToMarkdown(input)); }
    catch { alert("Conversion failed."); }
    finally { setConverting(false); }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mb-10">
      <div className="flex flex-col lg:flex-row min-h-[420px]">
        {/* Left: Input */}
        <div className="flex-1 flex flex-col border-b lg:border-b-0 lg:border-r border-gray-100">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{from.toUpperCase()}</span>
            <label className="inline-flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-md bg-indigo-50 text-indigo-600 cursor-pointer hover:bg-indigo-100 transition-all font-semibold border border-indigo-100">
              Upload {from.toUpperCase()}
              <input ref={fileRef} type="file" accept={acceptMap[from]} className="hidden" onChange={handleFileUpload} />
            </label>
          </div>
          <div className="flex-1 p-5">
            {from === "html" ? (
              <div className="flex flex-col h-full">
                <textarea value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 min-h-[280px] border border-gray-200 rounded-xl outline-none resize-none font-mono text-[13px] leading-[1.8] text-gray-800 p-4 focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 transition-all" placeholder="Paste your HTML here..." />
                <button onClick={handleTextConvert} disabled={!input.trim() || converting} className="mt-3 w-full bg-gray-900 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 disabled:opacity-40 transition-all">
                  {converting ? "Converting..." : "Convert Text"}
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-3xl mb-4">{from === "word" ? "📝" : "📑"}</div>
                <p className="text-sm text-gray-500 mb-1">Upload a <span className="font-medium text-gray-700">.{from === "word" ? "docx" : "pdf"}</span> file</p>
                <p className="text-xs text-gray-400">or drag and drop</p>
                {converting && <p className="text-xs text-indigo-500 mt-3 font-medium">⏳ Converting...</p>}
                {output && !converting && <p className="text-xs text-green-600 mt-3 font-medium">✅ Done!</p>}
              </div>
            )}
          </div>
        </div>

        {/* Right: Output */}
        <div className="flex-1 flex flex-col bg-gray-50/50">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Markdown</span>
            <div className="flex gap-1.5">
              <button onClick={() => navigator.clipboard.writeText(output)} disabled={!output} className="text-[11px] px-2.5 py-1.5 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 transition-all font-medium">Copy</button>
              <button onClick={() => downloadFile(output, "converted.md", "text/markdown")} disabled={!output} className="inline-flex items-center gap-1 bg-indigo-600 text-white px-3 py-1.5 rounded-md text-[11px] font-semibold hover:bg-indigo-700 shadow-sm shadow-indigo-200 disabled:opacity-40 transition-all">📝 Download MD</button>
            </div>
          </div>
          <div className="flex-1 p-5">
            <textarea value={output} readOnly className="w-full h-full min-h-[300px] border border-gray-200 rounded-xl outline-none resize-none font-mono text-[13px] leading-[1.8] text-gray-800 p-4 bg-white" placeholder="Converted Markdown will appear here..." />
          </div>
        </div>
      </div>
    </div>
  );
}
