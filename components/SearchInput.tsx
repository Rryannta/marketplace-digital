"use client";

import { Search } from "lucide-react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";// Opsional, tapi kita pakai manual timeout saja biar tanpa install library

export default function SearchInput() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  // Fungsi ini akan berjalan ketika user mengetik
  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams);

    // Jika ada ketikan, set param 'search'. Jika kosong, hapus.
    if (term) {
      params.set("search", term);
    } else {
      params.delete("search");
    }

    // Reset ke halaman 1 jika ada pagination (opsional)
    // params.set('page', '1');

    // Update URL tanpa refresh halaman
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="relative w-full">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
        size={18}
      />
      <input
        type="text"
        placeholder="Cari aset digital..."
        onChange={(e) => handleSearch(e.target.value)}
        defaultValue={searchParams.get("search")?.toString()} // Agar teks tidak hilang saat refresh
        className="w-full rounded-full bg-white/5 border border-white/10 py-2.5 pl-10 pr-4 text-sm text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
      />
    </div>
  );
}
