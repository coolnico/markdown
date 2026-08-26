"use client";

import Link from "next/link";
import { tools } from "@/lib/constants";
import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-sm shadow-indigo-200 group-hover:shadow-indigo-300 transition-shadow">
            M
          </div>
          <span className="text-[15px] font-bold tracking-tight text-gray-900">
            Markdown<span className="text-indigo-600">Converter</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 h-16">
          {tools.slice(0, 4).map((tool) => (
            <Link
              key={tool.id}
              href={`/${tool.slug}`}
              className="h-16 flex items-center px-3 text-[13px] font-medium text-gray-500 hover:text-gray-900 border-b-2 border-transparent hover:border-indigo-500 transition-all"
            >
              {tool.to}
            </Link>
          ))}
          <div className="relative group h-16 flex items-center">
            <button className="px-3 text-[13px] font-medium text-gray-500 hover:text-gray-900">
              More ▾
            </button>
            <div className="absolute top-14 right-0 bg-white border border-gray-100 rounded-xl shadow-xl shadow-gray-200/50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all min-w-[200px] py-1.5 backdrop-blur-xl">
              {tools.slice(4).map((tool) => (
                <Link key={tool.id} href={`/${tool.slug}`} className="flex items-center gap-2.5 px-4 py-2 text-[13px] text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
                  <span className="text-base">{tool.icon}</span> {tool.title}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {/* Right Side */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/blog" className="text-[13px] text-gray-500 hover:text-gray-900 transition-colors">Blog</Link>
          <Link href="/api" className="text-[13px] text-gray-500 hover:text-gray-900 transition-colors">API</Link>
          <div className="w-px h-4 bg-gray-200" />
          <Link href="/pricing" className="text-[13px] font-medium text-indigo-600 hover:text-indigo-700 transition-colors">Pro</Link>
          <Link href="/pricing" className="text-[13px] font-medium bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
            Get Started
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button className="md:hidden p-2 -mr-2 text-gray-500 hover:text-gray-900" onClick={() => setMenuOpen(!menuOpen)}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
            {menuOpen ? <path d="M5 5l10 10M15 5L5 15" /> : <><path d="M3 6h14M3 10h14M3 14h14" /></>}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-xl py-3 px-6 space-y-0.5">
          {tools.map((tool) => (
            <Link key={tool.id} href={`/${tool.slug}`} className="flex items-center gap-2.5 py-2.5 text-[14px] text-gray-700 hover:text-gray-900" onClick={() => setMenuOpen(false)}>
              <span>{tool.icon}</span> {tool.title}
            </Link>
          ))}
          <hr className="my-2 border-gray-100" />
          <Link href="/blog" className="block py-2.5 text-[14px] text-gray-600" onClick={() => setMenuOpen(false)}>Blog</Link>
          <Link href="/api" className="block py-2.5 text-[14px] text-gray-600" onClick={() => setMenuOpen(false)}>API</Link>
        </div>
      )}
    </header>
  );
}
