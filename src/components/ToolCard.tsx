import Link from "next/link";
import type { Tool } from "@/lib/constants";

export default function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Link
      href={`/${tool.slug}`}
      className="group relative bg-white border border-gray-100 rounded-2xl p-5 hover:border-gray-200 hover:shadow-lg hover:shadow-gray-100 transition-all duration-200"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-xl group-hover:from-indigo-50 group-hover:to-purple-50 transition-colors">
          {tool.icon}
        </div>
        <svg className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
      </div>
      <div className="text-[14px] font-semibold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">{tool.title}</div>
      <div className="text-[13px] text-gray-400 leading-relaxed">{tool.description}</div>
    </Link>
  );
}
