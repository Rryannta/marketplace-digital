"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X, Loader2, Clock, ArrowUpLeft } from "lucide-react"; // Tambah ikon Clock
import { useRouter } from "next/navigation";
import {
  getSearchSuggestions,
  getSearchHistory,
  saveSearchHistory,
} from "@/app/actions";
import Link from "next/link";

export default function SearchBar() {
  const [query, setQuery] = useState("");

  // State Data
  const [suggestions, setSuggestions] = useState<any[]>([]); // Hasil dari Produk
  const [historyList, setHistoryList] = useState<string[]>([]); // Hasil dari History

  // State UI
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // 1. Load History saat pertama kali (untuk jaga-jaga)
  useEffect(() => {
    async function loadHistory() {
      const history = await getSearchHistory();
      setHistoryList(history);
    }
    loadHistory();
  }, []);

  // 2. Logika Utama (Gabungan Debounce + Filter)
  useEffect(() => {
    // Kalau input kosong, jangan cari suggestion, tapi siapin history
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsLoading(true);

      // Ambil Suggestion dari Database Produk
      const productResults = await getSearchSuggestions(query);
      setSuggestions(productResults);

      // Refresh History juga (siapa tau ada update)
      const latestHistory = await getSearchHistory();
      setHistoryList(latestHistory);

      setIsLoading(false);
      setIsOpen(true);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  // 3. Handle Klik Luar (Tutup Dropdown)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  // 4. Eksekusi Pencarian (Simpan ke History -> Pindah Halaman)
  const performSearch = async (text: string) => {
    if (!text.trim()) return;

    setIsOpen(false);
    setQuery(text); // Update input biar user tau apa yang dicari

    // A. Simpan ke History (Backend)
    await saveSearchHistory(text);

    // B. Refresh history lokal biar langsung muncul kalau diklik lagi
    const updatedHistory = await getSearchHistory();
    setHistoryList(updatedHistory);

    // C. Pindah Halaman
    router.push(`/?search=${encodeURIComponent(text)}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(query);
  };

  // 5. Filter History Lokal (Match apa yang diketik)
  // Contoh: Ketik "ad", History "ado", "admin" akan muncul.
  const filteredHistory = query
    ? historyList.filter((h) => h.toLowerCase().includes(query.toLowerCase()))
    : historyList; // Kalau kosong, tampilkan semua history

  // Apakah ada sesuatu untuk ditampilkan?
  const showDropdown =
    isOpen && (filteredHistory.length > 0 || suggestions.length > 0);

  return (
    <div ref={wrapperRef} className="relative w-full max-w-md z-50">
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="absolute left-3 text-gray-400">
          <Search size={18} />
        </div>
        <input
          type="text"
          placeholder="Cari aset digital..."
          className="w-full rounded-full border border-white/10 bg-[#12121a] py-2.5 pl-10 pr-10 text-sm text-white placeholder-gray-500 transition focus:border-cyan-500/50 focus:bg-[#1a1a24] focus:outline-none focus:ring-4 focus:ring-cyan-500/10"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true); // Selalu buka pas ngetik
          }}
          onFocus={() => setIsOpen(true)} // Buka pas diklik (tampilkan history)
        />
        <div className="absolute right-3 text-gray-400">
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                }}
              >
                <X size={16} className="hover:text-white" />
              </button>
            )
          )}
        </div>
      </form>

      {/* DROPDOWN HASIL */}
      {showDropdown && (
        <div className="absolute top-full mt-2 w-full overflow-hidden rounded-xl border border-white/10 bg-[#1a1a24] shadow-2xl py-2">
          <ul>
            {/* BAGIAN 1: HISTORY (Ikon Jam) */}
            {filteredHistory.map((hist, idx) => (
              <li key={`hist-${idx}`}>
                <button
                  onClick={() => performSearch(hist)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition text-left"
                >
                  <Clock size={16} className="text-gray-500 min-w-[16px]" />
                  <span className="font-medium text-purple-400/90 truncate flex-1">
                    {hist}
                  </span>
                  <span className="text-[10px] text-gray-600 hidden group-hover:block">
                    History
                  </span>
                </button>
              </li>
            ))}

            {/* BAGIAN 2: SUGGESTION PRODUK (Ikon Search) */}
            {suggestions.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/products/${item.id}`} // Langsung ke detail produk
                  onClick={() => {
                    saveSearchHistory(item.title); // Simpan juga kalau diklik
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition"
                >
                  <Search size={16} className="text-gray-500 min-w-[16px]" />
                  <span className="truncate flex-1">{item.title}</span>
                  <span className="text-xs text-gray-600 border border-white/5 px-2 py-0.5 rounded-md">
                    {item.category}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
