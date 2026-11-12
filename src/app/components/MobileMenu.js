"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

const links = [
  ["Home", "/"],
  ["Features", "#features"],
  ["How it works", "#how"],
  ["About", "#about"],
];

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-200 transition active:scale-95"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <nav className="animate-fade-in absolute left-4 right-4 top-full z-30 mt-2 overflow-hidden rounded-2xl border border-white/10 bg-[#0c1424]/95 p-2 shadow-2xl backdrop-blur-xl">
          {links.map(([label, href]) => (
            <a
              key={label}
              href={href}
              onClick={() => setOpen(false)}
              className="block rounded-xl px-4 py-3 text-sm text-gray-300 transition hover:bg-blue-500/10 hover:text-blue-300"
            >
              {label}
            </a>
          ))}
        </nav>
      )}
    </div>
  );
}