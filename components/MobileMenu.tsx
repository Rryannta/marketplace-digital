"use client";

import Link from "next/link";
import {
  Flame,
  Sparkles,
  Tag,
  Cpu,
  Palette,
  Gamepad2,
  BookOpen,
  Music,
  Box,
} from "lucide-react";

// Kita copy data menu dari page.tsx biar konsisten
const DISCOVER_MENU = [
  {
    name: "Sedang Tren",
    icon: Flame,
    href: "/?filter=trending",
    key: "trending",
  },
  { name: "Terbaru", icon: Sparkles, href: "/?filter=new", key: "new" },
  { name: "Promo", icon: Tag, href: "/?filter=sale", key: "sale" },
];

const CATEGORIES = [
  { name: "Template Web", icon: Cpu, key: "Template Web" },
  { name: "Desain & UI", icon: Palette, key: "Desain & UI" },
  { name: "Game Assets", icon: Gamepad2, key: "Game Assets" },
  { name: "E-Books", icon: BookOpen, key: "E-Books" },
  { name: "Audio", icon: Music, key: "Audio" },
  { name: "3D Models", icon: Box, key: "3D Models" },
];

interface MobileMenuProps {
  currentCategory?: string;
  currentFilter?: string;
}

export default function MobileMenu({
  currentCategory,
  currentFilter,
}: MobileMenuProps) {
  return (
    <div className="sticky top-[73px] z-40 w-full border-b border-white/5 bg-[#05050a]/95 backdrop-blur-xl md:hidden">
      <div className="flex w-full items-center gap-2 overflow-x-auto p-4 scrollbar-hide">
        {/* Tombol RESET / HOME */}
        <Link
          href="/"
          className={`flex flex-shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition ${
            !currentCategory && !currentFilter
              ? "bg-white text-black"
              : "bg-white/5 text-gray-400 border border-white/10"
          }`}
        >
          All
        </Link>

        {/* Separator Tipis */}
        <div className="h-6 w-[1px] bg-white/10 mx-1 flex-shrink-0"></div>

        {/* BAGIAN DISCOVER (Trending, New, etc) */}
        {DISCOVER_MENU.map((item) => {
          const isActive = currentFilter === item.key;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition border ${
                isActive
                  ? "bg-cyan-500/10 border-cyan-500 text-cyan-400"
                  : "bg-white/5 border-white/5 text-gray-300"
              }`}
            >
              <item.icon size={14} />
              {item.name}
            </Link>
          );
        })}

        {/* Separator Tipis */}
        <div className="h-6 w-[1px] bg-white/10 mx-1 flex-shrink-0"></div>

        {/* BAGIAN KATEGORI */}
        {CATEGORIES.map((cat) => {
          const isActive = currentCategory === cat.key;
          return (
            <Link
              key={cat.name}
              href={`/?category=${cat.key}`}
              className={`flex flex-shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition border ${
                isActive
                  ? "bg-white text-black border-white"
                  : "bg-white/5 border-white/5 text-gray-300"
              }`}
            >
              <cat.icon size={14} />
              {cat.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
