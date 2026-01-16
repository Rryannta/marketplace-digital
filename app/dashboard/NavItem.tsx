"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavItem({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  const pathname = usePathname();
  // Cek apakah URL sekarang SAMA PERSIS dengan href menu ini
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200
        ${
          isActive
            ? "bg-cyan-500/10 text-cyan-400 shadow-[inset_3px_0_0_0_#22d3ee]" // Style AKTIF
            : "text-gray-400 hover:bg-white/5 hover:text-white hover:pl-5" // Style BIASA
        }
      `}
    >
      <span
        className={`${
          isActive ? "text-cyan-400" : "group-hover:text-cyan-400"
        } transition-colors`}
      >
        {icon}
      </span>
      {label}
    </Link>
  );
}
